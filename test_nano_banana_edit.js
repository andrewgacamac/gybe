
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

const MODEL_NAME = 'gemini-3-pro-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

async function testBananaEdit() {
    console.log(`Testing ${MODEL_NAME} for House Editing...`);

    // Tiny 1x1 Red Pixel
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const payload = {
        contents: [{
            parts: [
                { text: "This is a photo of a house. Create a new image that is identical to this photo, but replace the existing grass/lawn with a perfectly installed, lush green artificial turf. Keep the house, sky, and other landscaping exactly the same." },
                { inlineData: { mimeType: "image/png", data: base64Image } }
            ]
        }]
    };

    try {
        console.log(`Sending request...`);
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
        const finishReason = result.candidates?.[0]?.finishReason;
        console.log('Finish Reason:', finishReason);

        if (result.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            console.log('SUCCESS: Image Data Found!');
        } else {
            console.log('FAILURE: No image data.');
            console.log('Result:', JSON.stringify(result));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testBananaEdit();
