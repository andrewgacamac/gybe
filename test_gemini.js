
// Helper to mimick the edge function logic locally with Node
const fetch = globalThis.fetch;

const GOOGLE_AI_API_KEY = 'AIzaSyD9_lIfxnD6pjdC2jaXneLJ6fblUo-Pnw0'; // Hardcoded for test
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function testGemini() {
    console.log('Testing Gemini API...');

    // Mock lead data
    const leadData = {
        first_name: 'Test',
        last_name: 'User',
        address: '123 Fake St',
        email: 'test@example.com'
    };

    const prompt = `
        You are an expert artificial turf estimator for YardGuard.
        Based on the customer's request, provide a preliminary cost estimate range.
        
        Customer: ${leadData.first_name} ${leadData.last_name}
        Address: ${leadData.address || 'Not provided'}
        Needs: Standard residential installation.
        
        Please provide:
        1. Estimated square footage (guess based on standard suburban yard if unknown, say 500-800 sq ft).
        2. Price range ($12-$18 per sq ft).
        3. Total estimated cost range.
        4. Brief explanation of benefits (low maintenance, pet friendly).
        
        Keep it professional and concise.
    `;

    try {
        console.log(`Sending request to: ${GEMINI_ENDPOINT}?key=...`);

        const response = await fetch(`${GEMINI_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Status:', response.status);
            console.error('API Error Body:', errorText);
            return;
        }

        const result = await response.json();
        console.log('--- API RESPONSE ---');
        console.log(JSON.stringify(result, null, 2));

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            console.log('\n--- EXTRACTED TEXT ---');
            console.log(text.substring(0, 200) + '...');
            console.log('\nSUCCESS! API Key and Endpoint are working.');
        } else {
            console.error('RESPONSE OK but no text found.');
        }

    } catch (error) {
        console.error('Network/Fetch Error:', error);
    }
}

testGemini();
