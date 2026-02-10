
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Credentials from test_rls.js (assuming active dev usage)
const SUPABASE_URL = 'https://elzshapellgisvsnjgfw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsenNoYXBlbGxnaXN2c25qZ2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTY2OTYsImV4cCI6MjA4NjA3MjY5Nn0.HmKPNe0TADEkw0F47JeivLa_lUj-jx7PowwbcCOvb3E';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testGuidePattern() {
    console.log('Testing Guide Pattern: INSERT with .select(), no idempotency_key...');

    const payload = {
        first_name: 'Guide',
        last_name: 'Pattern',
        email: 'guide@test.com',
        phone: '555-0199',
        address: '123 Guide Logic Lane',
        status: 'NEW'
        // Missing: idempotency_key, id (relying on defaults)
    };

    const { data, error } = await supabase
        .from('leads')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('❌ FAILED:', error.message);
        console.log('Reason: Likely missing SELECT policy for anon OR missing idempotency_key default.');
    } else {
        console.log('✅ SUCCESS! Lead Created:', data);
    }
}

testGuidePattern();
