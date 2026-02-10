
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUsers() {
    console.log('Checking admin_users table...');

    const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('*');

    if (error) {
        console.error('Error fetching admin_users:', error);
    } else {
        console.log(`Found ${adminUsers.length} admin users.`);
        console.log(JSON.stringify(adminUsers, null, 2));
    }
}

checkAdminUsers();
