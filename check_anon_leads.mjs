
import { createClient } from '@supabase/supabase-js';

// ANON KEY (Public Key) - Simulates exactly what the dashboard sees
const SUPABASE_URL = 'https://elzshapellgisvsnjgfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsenNoYXBlbGxnaXN2c25qZ2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTY2OTYsImV4cCI6MjA4NjA3MjY5Nn0.HmKPNe0TADEkw0F47JeivLa_lUj-jx7PowwbcCOvb3E';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    console.log('--- CHECKING LEADS WITH ANON KEY ---');
    console.log('URL:', SUPABASE_URL);

    // 1. Check Leads Table
    const { data: leads, count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('ANON KEY ERROR:', error);
    } else {
        console.log('Total Leads Visible (Anon):', count);
        console.log('Leads List:');
        leads.forEach(l => {
            console.log(` - ${l.first_name} ${l.last_name} (Status: ${l.status}) ID: ${l.id}`);
        });
    }

    if (leads && leads.length > 0) {
        const lead = leads[0];
        console.log('\n--- CHECKING PHOTOS FOR LEAD:', lead.id, '---');

        // 2. Check Photos Table linkage
        const { data: photos, error: photoError } = await supabase
            .from('photos')
            .select('*')
            .eq('lead_id', lead.id);

        if (photoError) console.error('Photo Query Error:', photoError);
        else console.log('Photos in DB:', photos.length);

        if (photos && photos.length > 0) {
            const photo = photos[0];
            console.log('Photo Path:', photo.original_path);

            // 3. Check Public URL Access
            const { data: urlData } = supabase.storage
                .from('raw_uploads')
                .getPublicUrl(photo.original_path);

            console.log('Public URL:', urlData.publicUrl);

            // Try fetching it to see if it 404s
            try {
                const res = await fetch(urlData.publicUrl, { method: 'HEAD' });
                console.log('Public URL Status:', res.status, res.statusText);
            } catch (e) {
                console.error('Fetch Check Error:', e.message);
            }
        }
    }
}

check();
