
const fetch = globalThis.fetch;
const OPENROUTER_API_KEY = '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';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-exp:free';

async function testFlux() {
    console.log('Testing Flux 1.1 Pro via Chat Completions...');

    // Some image models on OpenRouter work by sending a prompt to chat
    // and receiving a Markdown image URL result.

    const payload = {
        model: MODEL,
        messages: [
            { role: 'user', content: 'Generate an image of a cat.' }
        ]
    };

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://yardguard.app',
                'X-Title': 'YardGuard Visualizer Test',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.log('Error:', response.status, await response.text());
        } else {
            console.log('Success:', JSON.stringify(await response.json(), null, 2));
        }

    } catch (e) {
        console.log('Exception:', e);
    }
}

testFlux();
