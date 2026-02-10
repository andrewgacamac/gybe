
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://elzshapellgisvsnjgfw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsenNoYXBlbGxnaXN2c25qZ2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ5NjY5NiwiZXhwIjoyMDg2MDcyNjk2fQ.3fBEUumllij8ywidF-HrrzdGjaqGnqCoMMKc-LObDN4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function verifyColumns() {
    console.log('Verifying leads table columns...');

    // We can't easily query information_schema via JS client directly without sql function, 
    // but we can try to insert a dummy record with the new columns and see if it errors, 
    // or select from the table and see if columns are returned (if there are rows).

    // Better yet, let's just try to select one row and look at the structure, 
    // or trust the user if they said "done". 
    // Actually, the error "Could not find column" came from the client library cache sometimes 
    // if the client isn't re-initialized, but usually it's the DB.

    // Let's try to select the new columns specifically.
    const { data, error } = await supabase
        .from('leads')
        .select('package_interest, project_type, approximate_size')
        .limit(1);

    if (error) {
        console.error('❌ Verification Failed:', error.message);
        console.log('The columns do not appear to exist yet.');
    } else {
        console.log('✅ Verification Successful: Columns exist.');
    }
}

verifyColumns();
