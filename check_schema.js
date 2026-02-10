require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkTable() {
    console.log('Checking admin_users table...');
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting from admin_users:', error);
    } else {
        console.log('Success! Table exists. Row count:', data.length);
    }
}

checkTable();
