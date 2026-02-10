
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
// USING ANON KEY - simulating the public form
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testAnonInsert() {
    console.log('Testing INSERT with ANON key...');

    const leadId = crypto.randomUUID();
    const idempotencyKey = crypto.randomUUID();

    const { data, error } = await supabase
        .from('leads')
        .insert({
            id: leadId,
            first_name: 'RLS',
            last_name: 'Test',
            email: 'rls@test.com',
            address: '123 RLS Blvd',
            idempotency_key: idempotencyKey,
            status: 'NEW'
        });
    // Intentionally NOT chaining .select()

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Success! Lead inserted (no data returned).');
    }
}

testAnonInsert();
