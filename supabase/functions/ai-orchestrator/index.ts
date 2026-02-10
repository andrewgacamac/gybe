
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createLogger } from '../_shared/logging.ts';
import { errorToResponse, ValidationError } from '../_shared/errors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';
import { downloadFile, uploadFile, BUCKETS } from '../_shared/storage.ts';
import { handleCors, withCors } from '../_shared/cors.ts';
import { Lead } from '../_shared/types.ts';
import { transformYardPhoto } from '../_shared/ai-visualizer.ts';
import { generateAIEstimate } from '../_shared/ai-estimator.ts';

serve(async (req: Request) => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const logger = createLogger(req);
    logger.info('ai-orchestrator invoked');

    let lead_id: string | undefined;

    try {
        const payload = await req.json();
        lead_id = payload.lead_id;

        if (!lead_id) {
            throw new ValidationError('lead_id is required');
        }

        const supabase = getSupabaseAdmin();

        // Fetch lead
        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', lead_id)
            .single();

        if (leadError || !lead) {
            throw new ValidationError('Lead not found');
        }

        logger.info('Processing lead', { lead_id, email: lead.email });

        // Fetch photos
        const { data: photos, error: photosError } = await supabase
            .from('photos')
            .select('*')
            .eq('lead_id', lead_id);

        if (photosError || !photos || photos.length === 0) {
            // Even if no photos, we can still estimate based on address?
            // But requirement implies photos needed for visualizer.
            // Let's proceed with estimate only if photos missing?
            // Actually, allow estimate generation even with 0 photos.
            logger.warn('No photos found for lead', { lead_id });
        } else {
            logger.info('Found photos to process', { count: photos.length });

            // Process each photo with AI Visualizer
            for (const photo of photos) {
                logger.info('Processing photo', { photo_id: photo.id, path: photo.original_path });

                // Download original photo
                const imageBlob = await downloadFile(supabase, BUCKETS.RAW_UPLOADS, photo.original_path);
                if (!imageBlob) {
                    logger.error('Failed to download photo', undefined, { photo_id: photo.id });
                    continue;
                }

                // Transform with AI
                const result = await transformYardPhoto(imageBlob, photo.original_path);

                if (result.success && result.imageData) {
                    // Upload processed image
                    const processedPath = `processed/${lead_id}/${photo.id}.png`;
                    const uploadedPath = await uploadFile(
                        supabase,
                        BUCKETS.PROCESSED_IMAGES,
                        processedPath,
                        result.imageData,
                        result.mimeType || 'image/png'
                    );

                    if (uploadedPath) {
                        // Update photo record with processed path
                        await supabase
                            .from('photos')
                            .update({ processed_path: uploadedPath })
                            .eq('id', photo.id);

                        logger.info('Photo processed and uploaded', { photo_id: photo.id, path: uploadedPath });
                    }
                } else {
                    logger.warn('Photo processing failed', { photo_id: photo.id, error: result.error });
                }
            }
        }

        // Generate estimate using AI Estimator
        // Note: generateAIEstimate expects (leadData, imageUrl?)
        // We pass the lead object.
        const estimateResult = await generateAIEstimate(lead as Lead, undefined);
        const aiEstimate = estimateResult.estimateText || 'Estimate generation failed';

        // Update lead with estimate and status
        const { error: updateError } = await supabase
            .from('leads')
            .update({
                ai_estimate: aiEstimate,
                status: 'NEEDS_REVIEW',
            })
            .eq('id', lead_id);

        if (updateError) {
            logger.error('Failed to update lead', new Error(updateError.message));
            throw new Error('Failed to update lead status');
        }

        logger.info('Lead processing complete', { lead_id, status: 'NEEDS_REVIEW' });

        return withCors(new Response(JSON.stringify({
            success: true,
            lead_id,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }));

    } catch (error) {
        logger.error('ai-orchestrator error', error as Error);

        // Update lead to FAILED status if we have the ID
        if (lead_id) {
            try {
                const supabase = getSupabaseAdmin();
                await supabase
                    .from('leads')
                    .update({ status: 'FAILED' })
                    .eq('id', lead_id);
            } catch (cleanupError) {
                logger.error('Failed to set status to FAILED', cleanupError as Error);
            }
        }

        return withCors(errorToResponse(error as Error, logger.getRequestId()));
    }
});
