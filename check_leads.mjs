import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- CHECKING LEADS ---');
    const { data: leads, count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact' });

    if (error) { console.error(error); return; }
    
    console.log('Total Leads in DB:', count);
    console.log('Leads List:');
    leads.forEach(l => {
        console.log(` - ${l.first_name} ${l.last_name} (Status: ${l.status}) ID: ${l.id}`);
    });
}

check();
