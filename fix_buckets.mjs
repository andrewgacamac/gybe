
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    console.log('Fixing Buckets...');

    // Fix raw_uploads
    const { data: b1, error: e1 } = await supabase.storage.updateBucket('raw_uploads', { public: true });
    if (e1) console.error('Error updating raw_uploads:', e1);
    else console.log('Updated raw_uploads PUBLIC:', b1.public);

    // Fix processed_images
    const { data: b2, error: e2 } = await supabase.storage.updateBucket('processed_images', { public: true });
    if (e2) console.error('Error updating processed_images:', e2);
    else console.log('Updated processed_images PUBLIC:', b2.public);
}

fix();
