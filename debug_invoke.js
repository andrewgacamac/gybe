
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://elzshapellgisvsnjgfw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsenNoYXBlbGxnaXN2c25qZ2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ5NjY5NiwiZXhwIjoyMDg2MDcyNjk2fQ.3fBEUumllij8ywidF-HrrzdGjaqGnqCoMMKc-LObDN4';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function debugOrchestrator() {
    console.log('Fetching a stuck lead...');

    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, status')
        .eq('status', 'PROCESSING')
        .limit(1);

    if (error || !leads || leads.length === 0) {
        console.log('No stuck leads found (or error reading DB).');
        if (error) console.error(error);
        return;
    }

    const lead = leads[0];
    console.log(`Found Lead: ${lead.id} [${lead.status}]`);
    console.log('Invoking ai-orchestrator manually...');

    // Manually invoke the Edge Function
    const { data, error: invokeError } = await supabase.functions.invoke('ai-orchestrator', {
        body: { leadId: lead.id }
    });

    if (invokeError) {
        console.error('FUNCTION ERROR:', invokeError);
    } else {
        console.log('FUNCTION SUCCESS:', data);
    }
}

debugOrchestrator();
