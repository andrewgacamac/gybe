
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

// "Nano Banana Pro"
const MODEL_NAME = 'gemini-3-pro-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

async function testNanoBananaPro() {
    console.log(`Testing ${MODEL_NAME} for Image Generation/Editing...`);

    // Test 1: Text-to-Image Generation
    const payloadGen = {
        contents: [{
            parts: [{ text: "Generate a photorealistic image of a modern house with a green lawn." }]
        }]
    };

    try {
        console.log(`Sending Generation Request...`);
        const response = await fetch(`${ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadGen)
        });

        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            console.log('Generation Success! Image Data Found.');
        } else {
            console.log('Generation Result:', JSON.stringify(result));
        }

    } catch (error) {
        console.error('Generation Error:', error);
    }
}

testNanoBananaPro();
