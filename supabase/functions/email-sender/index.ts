
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

console.log("Email Sender: Starting (Clean Version)...");

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
    // CORS Manually (Inline)
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        const payload = await req.json();
        console.log('Payload:', Object.keys(payload));

        let leadId: string | undefined;

        if (payload.lead_id) {
            leadId = payload.lead_id;
        } else if (payload.record?.id) {
            leadId = payload.record.id;
            // Webhook check? Skip for simplicity in debug phase, just send if invoked.
        }

        if (!leadId) {
            throw new Error('Missing lead_id');
        }

        console.log(`Fetching Lead: ${leadId}`);
        const { data: lead, error: leadError } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

        if (leadError || !lead) throw new Error(`Lead fetch failed: ${leadError?.message}`);

        console.log(`Fetching Photos...`);
        const { data: photos } = await supabaseAdmin
            .from('photos')
            .select('*')
            .eq('lead_id', leadId);

        // Generate URLs
        let originalUrl = '';
        let processedUrl = '';

        if (photos && photos.length > 0) {
            const p = photos[0]; // Just grab first one
            if (p.original_path) {
                const { data } = await supabaseAdmin.storage.from('raw_uploads').createSignedUrl(p.original_path, 604800);
                if (data) originalUrl = data.signedUrl;
            }
            if (p.processed_path) {
                const { data } = await supabaseAdmin.storage.from('processed_images').createSignedUrl(p.processed_path, 604800);
                if (data) processedUrl = data.signedUrl;
            }
        }

        // HTML Content
        const firstName = lead.first_name || 'Valued Customer';
        const estimateText = lead.final_estimate || lead.ai_estimate || 'Pending Estimate';
        // Simple line break replacement
        const formattedEstimate = estimateText.replace(/\n/g, '<br>');

        const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2>Your YardGuard Quote is Ready!</h2>
            <p>Hi ${firstName},</p>
            <p>Great news! Your artificial turf transformation proposal is ready.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Estimated Quote</h3>
                <p style="white-space: pre-wrap;">${formattedEstimate}</p>
            </div>

            ${processedUrl ? `
            <div style="margin: 20px 0;">
                <h3>Your New Yard Design</h3>
                <img src="${processedUrl}" style="width: 100%; border-radius: 8px; border: 1px solid #ddd;" alt="AI Design">
                <br>
                <small><a href="${processedUrl}">View Full Size</a></small>
            </div>
            ` : '<p><i>(No design available)</i></p>'}


            <p>Best,<br>The YardGuard Team</p>
        </div>
    `;

        console.log(`Sending Email to ${lead.email}`);
        if (!RESEND_API_KEY) throw new Error("No RESEND_API_KEY");

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: lead.email,
                subject: `Your YardGuard Quote is Ready! 🌿`,
                html: htmlContent
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Resend Error: ${res.status} ${txt}`);
        }

        const emailRes = await res.json();
        console.log('Success:', emailRes.id);

        // Update DB status
        await supabaseAdmin.from('leads').update({ status: 'COMPLETED' }).eq('id', leadId);

        return new Response(JSON.stringify({
            success: true,
            message: "Email Sent!",
            id: emailRes.id
        }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });

    } catch (e) {
        console.error("Function Crash:", e);
        return new Response(JSON.stringify({
            success: false,
            error: String(e)
        }), {
            status: 500, // Or 400
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
});
