
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Using Service Role Key to bypass RLS for debugging - we want to see RAW truth
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- CHECKING RECENT LEAD PHOTOS ---');

    // 1. Get Most Recent Lead
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) { console.error('Error fetching lead:', error); return; }
    if (!leads || leads.length === 0) { console.log('No leads found.'); return; }

    const lead = leads[0];
    console.log(`Latest Lead: ${lead.first_name} ${lead.last_name}`);
    console.log(`ID: ${lead.id}`);
    console.log(`Created: ${new Date(lead.created_at).toLocaleString()}`);

    // 2. Check Photos Table (Database Records)
    const { data: photos, error: photoError } = await supabase
        .from('photos')
        .select('*')
        .eq('lead_id', lead.id);

    if (photoError) { console.error('Error fetching photos:', photoError); }
    else {
        console.log(`\nPhotos in DB Table: ${photos.length}`);
        photos.forEach(p => console.log(` - ID: ${p.id}, Path: ${p.original_path}`));
    }

    // 3. Check Storage Bucket (Physical Files)
    // We list the folder corresponding to the lead ID
    const { data: files, error: listError } = await supabase.storage
        .from('raw_uploads')
        .list(lead.id + '/'); // Trailing slash might matter depending on implementation, usually prefix is enough

    if (listError) {
        // Try listing root to see if folder exists or if list connects at all
        console.error('Error listing storage folder:', listError);
        const { data: rootFiles } = await supabase.storage.from('raw_uploads').list();
        console.log('Root files in bucket:', rootFiles ? rootFiles.length : 0);
    } else {
        console.log(`\nFiles in Storage (raw_uploads/${lead.id}): ${files.length}`);
        files.forEach(f => console.log(` - ${f.name} (${f.metadata?.size} bytes)`));
    }
}

check();
