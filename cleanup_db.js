
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://elzshapellgisvsnjgfw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsenNoYXBlbGxnaXN2c25qZ2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ5NjY5NiwiZXhwIjoyMDg2MDcyNjk2fQ.3fBEUumllij8ywidF-HrrzdGjaqGnqCoMMKc-LObDN4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function cleanDatabase() {
    console.log('Starting database cleanup...');

    // 1. Delete all leads (Cascades to photos, lead_events)
    const { error: deleteError, count } = await supabase
        .from('leads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything where ID is not nil (effectively all)

    if (deleteError) {
        console.error('Error deleting leads:', deleteError.message);
    } else {
        // Note: delete() doesn't always return count unless select() is used, but we assume success if no error.
        console.log('Leads table cleared.');
    }

    // 2. Clear Audit Log? (Optional, but user said "start fresh")
    // Let's keep audit log for admin tracking unless requested, but "start fresh" implies leads.
    // I'll leave Admin Users and Audit Log intact so you don't lose your account.

    console.log('Cleanup complete! Database is ready for fresh submissions.');
}

cleanDatabase();
