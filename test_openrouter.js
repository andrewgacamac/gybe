
const fetch = globalThis.fetch;
const OPENROUTER_API_KEY = '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';
const IMAGE_ENDPOINT = 'https://openrouter.ai/api/v1/images/generations';

async function testDalle() {
    console.log('Testing DALL-E via OpenRouter...');

    // Try DALL-E 3 first
    try {
        console.log('Attempting openai/dall-e-3...');
        const res3 = await fetch(IMAGE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://yardguard.app',
                'X-Title': 'YardGuard Visualizer',
            },
            body: JSON.stringify({
                model: 'openai/dall-e-3',
                prompt: "A beautiful backyard with artificial turf.",
                n: 1,
                size: "1024x1024"
            })
        });

        if (res3.ok) {
            const data = await res3.json();
            console.log('SUCCESS DALL-E 3:', JSON.stringify(data, null, 2));
            return;
        } else {
            console.log('Failed DALL-E 3:', res3.status, await res3.text());
        }

    } catch (e) {
        console.log('Error DALL-E 3:', e);
    }

    // Try DALL-E 2 fallback
    try {
        console.log('Attempting openai/dall-e-2...');
        const res2 = await fetch(IMAGE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://yardguard.app',
                'X-Title': 'YardGuard Visualizer',
            },
            body: JSON.stringify({
                model: 'openai/dall-e-2',
                prompt: "A beautiful backyard with artificial turf.",
                n: 1,
                size: "1024x1024"
            })
        });

        if (res2.ok) {
            const data = await res2.json();
            console.log('SUCCESS DALL-E 2:', JSON.stringify(data, null, 2));
            return;
        } else {
            console.log('Failed DALL-E 2:', res2.status, await res2.text());
        }

    } catch (e) {
        console.log('Error DALL-E 2:', e);
    }
}

testDalle();
