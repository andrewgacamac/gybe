
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

// Trying standard 'predict' with image payload
const IMAGEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict';
// OR maybe 'imagen-4.0-generate-001'? 

async function testImagenInpainting() {
    console.log('Testing Imagen Inpainting (Image Input)...');

    // Tiny 1x1 Red Pixel
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const payload = {
        instances: [
            {
                prompt: "Replace the red pixel with green logic.",
                image: {
                    bytesBase64Encoded: base64Image
                }
            }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
        }
    };

    try {
        console.log(`Sending request...`);

        const response = await fetch(`${IMAGEN_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Status:', response.status);
            console.error('API Error Body:', errorText);
            return;
        }

        const result = await response.json();
        console.log('--- SUCCESS ---');
        console.log("Prediction count:", result.predictions?.length);

    } catch (error) {
        console.error('Network Error:', error);
    }
}

testImagenInpainting();
