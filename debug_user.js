
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://elzshapellgisvsnjgfw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsenNoYXBlbGxnaXN2c25qZ2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ5NjY5NiwiZXhwIjoyMDg2MDcyNjk2fQ.3fBEUumllij8ywidF-HrrzdGjaqGnqCoMMKc-LObDN4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function insertTestLead() {
    console.log('Inserting test lead via Service Role...');

    const leadId = crypto.randomUUID();
    const idempotencyKey = crypto.randomUUID();

    const { data, error } = await supabase
        .from('leads')
        .insert({
            id: leadId,
            first_name: 'System',
            last_name: 'Test',
            email: 'system@test.com',
            address: '123 Test Lane',
            idempotency_key: idempotencyKey,
            status: 'NEEDS_REVIEW', // Skip NEW so we can see it in default dashboard view
            ai_estimate: 'System generated estimate for testing.'
        })
        .select()
        .single();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Success! Lead inserted:', data.id);
    }
}

insertTestLead();
