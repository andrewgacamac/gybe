
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

// Trying "Nano Banana" (Gemini 2.5 Flash Image)
// Model Name from list: 'models/gemini-2.5-flash-image'
const MODEL_NAME = 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

async function testNanoBanana() {
    console.log(`Testing ${MODEL_NAME} for Image Editing...`);

    // Tiny 1x1 Red Pixel (to represent the yard)
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const payload = {
        contents: [{
            parts: [
                { text: "Replace the red color with green artificial turf. Keep the rest the same." },
                { inlineData: { mimeType: "image/png", data: base64Image } }
            ]
        }]
    };

    try {
        console.log(`Sending request to ${ENDPOINT}...`);

        const response = await fetch(`${ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('API Error:', response.status, await response.text());
            return;
        }

        const result = await response.json();
        console.log('--- SUCCESS ---');
        // Check for image in response
        const parts = result.candidates?.[0]?.content?.parts;
        if (parts) {
            parts.forEach((part, i) => {
                if (part.text) console.log(`Part ${i} (Text):`, part.text);
                if (part.inlineData) console.log(`Part ${i} (Image):`, part.inlineData.mimeType, 'Size:', part.inlineData.data.length);
                if (part.fileData) console.log(`Part ${i} (File):`, part.fileData.fileUri);
            });
        } else {
            console.log('No content parts found:', JSON.stringify(result));
        }

    } catch (error) {
        console.error('Network Error:', error);
    }
}

testNanoBanana();
