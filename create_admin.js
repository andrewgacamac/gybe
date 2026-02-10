
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://elzshapellgisvsnjgfw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsenNoYXBlbGxnaXN2c25qZ2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ5NjY5NiwiZXhwIjoyMDg2MDcyNjk2fQ.3fBEUumllij8ywidF-HrrzdGjaqGnqCoMMKc-LObDN4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function createAdmin() {
    const email = 'admin@yardguard.com';
    const password = 'yardguard-admin';

    console.log(`Checking/Creating user ${email}...`);

    // 1. Check if user exists by listing users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('List Error:', listError.message);
    }

    const existingUser = users?.find(u => u.email === email);

    let userId;

    if (existingUser) {
        console.log('User already exists:', existingUser.id);
        userId = existingUser.id;
        // Update password just in case
        await supabase.auth.admin.updateUserById(userId, { password });
    } else {
        // try creating
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) {
            console.error('Create Error:', createError.message);
            // If error persists, maybe trigger issue?
            process.exit(1);
        }
        userId = user.id;
        console.log('User created:', userId);
    }

    // 2. Ensure admin_users record exists and is admin
    // We upsert to be safe
    console.log('Upserting admin_users record...');
    const { error: upsertError } = await supabase
        .from('admin_users')
        .upsert({
            id: userId,
            email: email,
            role: 'admin',
            is_active: true
        });

    if (upsertError) {
        console.error('Upsert Error:', upsertError.message);
    } else {
        console.log('Successfully set as ADMIN.');
    }
}

createAdmin();
