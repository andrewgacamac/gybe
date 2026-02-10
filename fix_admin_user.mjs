import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) { console.error('Error listing users:', error); return; }

    const user = users.find(u => u.email === 'admin@yardguard.com');

    if (!user) { console.log('User not found'); return; }

    console.log('User Status:', user);
    console.log('Confirmed At (Previous):', user.email_confirmed_at);

    // Force confirm and update password
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
            email_confirmed_at: new Date().toISOString(),
            password: 'yardguard2026',
            user_metadata: { role: 'admin' }
        }
    );

    if (updateError) console.error(updateError);
    else console.log('User updated/confirmed:', data.user);
}

fix();
