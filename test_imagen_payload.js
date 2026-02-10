
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

const IMAGEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict';

async function testVisualizerPayload() {
    console.log('Testing Exact Visualizer Payload...');

    const payload = {
        instances: [
            {
                prompt: "A photorealistic, high-resolution architectural photo of a modern suburban backyard featuring a perfectly installed, lush green artificial turf lawn. Manicured landscaping, bright sunny day, 4k detail, professional photography."
            }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1" // Or 4:3?
        }
    };

    try {
        console.log(`Sending request...`);
        const response = await fetch(`${IMAGEN_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('API Error:', response.status, await response.text());
            return;
        }

        const result = await response.json();
        console.log('Success! Predictions:', result.predictions?.length);
        if (result.predictions?.[0]?.bytesBase64Encoded) {
            console.log('Has Base64 Data: YES');
            console.log('Base64 Length:', result.predictions[0].bytesBase64Encoded.length);
        } else {
            console.log('Has Base64 Data: NO');
            console.log('Result:', JSON.stringify(result));
        }

    } catch (error) {
        console.error('Network Error:', error);
    }
}

testVisualizerPayload();
