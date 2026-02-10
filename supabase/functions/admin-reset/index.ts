
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, withCors } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

serve(async (req: Request) => {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        console.log('Admin Reset Invoked (REAL DELETE MODE)');

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase Service Credentials missing on server.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Delete ALL leads
        // We use a filter that matches all valid UUIDs or just created_at > 1970
        // The most robust way to delete all rows in Supabase is using a generic filter
        const { error, count } = await supabase
            .from('leads')
            .delete({ count: 'exact' })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Assuming UUID PK

        if (error) {
            console.error('Delete Error:', error);
            throw error;
        }

        console.log(`Deleted ${count} rows.`);

        return withCors(new Response(JSON.stringify({
            success: true,
            message: `Deleted ${count} leads.`,
            count: count
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));

    } catch (error) {
        console.error('Reset Failed:', error);
        return withCors(new Response(JSON.stringify({
            success: false,
            error: String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }));
    }
});
