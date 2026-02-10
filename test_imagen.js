
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

// Endpoint we are trying to use
const IMAGEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict';

async function testImagen() {
    console.log('Testing Imagen API...');

    // Create a tiny 1x1 pixel red image (Base64)
    // This is valid PNG data
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const payload = {
        instances: [
            {
                prompt: "A photo of a modern house with a perfectly installed, lush green artificial turf lawn."
            }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
        }
    };

    try {
        console.log(`Sending request to: ${IMAGEN_ENDPOINT}?key=...`);

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
        console.log('--- API RESPONSE ---');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Network Error:', error);
    }
}

testImagen();
