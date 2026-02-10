
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

const MODEL_NAME = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GOOGLE_AI_API_KEY}`;

async function testBananaFlash() {
    console.log(`Starting Request to ${MODEL_NAME}...`);

    const payload = {
        contents: [{
            parts: [{ text: "Generate a photo of a modern house with a green artificial turf lawn." }]
        }]
    };

    try {
        const start = Date.now();
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        const duration = (Date.now() - start) / 1000;
        console.log(`Duration: ${duration}s`);
        console.log(`Status: ${response.status}`);

        try {
            const json = JSON.parse(text);
            if (json.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
                console.log('Success! Image Generated.');
            } else {
                console.log('Failed:', text.substring(0, 500));
            }
        } catch (e) {
            console.log('Result (Text):', text.substring(0, 500));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testBananaFlash();
