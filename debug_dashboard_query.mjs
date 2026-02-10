
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for debugging

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing dashboard query...');

    // 1. Count leads
    const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting leads:', countError);
    } else {
        console.log(`Total leads in DB: ${count}`);
    }

    // 2. Run the exact dashboard query
    const { data, error } = await supabase
        .from('leads')
        .select(`
            *,
            photos (count)
        `)
        .range(0, 19);

    if (error) {
        console.error('Dashboard Query FAILED:', error);
    } else {
        console.log(`Dashboard Query returned ${data.length} records.`);
        if (data.length > 0) {
            console.log('Sample record:', JSON.stringify(data[0], null, 2));
        }
    }
}

testQuery();
