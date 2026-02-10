
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyD9_lIfxnD6pjdC2jaXneLJ6fblUo-Pnw0';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

async function testGeminiVision() {
    console.log('Testing Gemini Vision...');

    // Tiny 1x1 Red Pixel
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const payload = {
        contents: [{
            parts: [
                { text: "What color is this image?" },
                { inlineData: { mimeType: "image/png", data: base64Image } }
            ]
        }]
    };

    try {
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('Gemini Vision Response:', text || JSON.stringify(result));
    } catch (e) {
        console.error('Error:', e);
    }
}

testGeminiVision();
