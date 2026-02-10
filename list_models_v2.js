
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyBB6hzhWMEPCbZgZvTYB3-lTG2TXG7wsJI';

async function listModels() {
    console.log('Listing Models...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_AI_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log(`Found ${data.models.length} models.`);

            const banana = data.models.filter(m =>
                m.name.toLowerCase().includes('banana') ||
                m.name.toLowerCase().includes('nano') ||
                m.name.toLowerCase().includes('gemini-2.5') ||
                m.name.toLowerCase().includes('gemini-3')
            );

            console.log('--- POTENTIAL "NANO BANANA" MODELS ---');
            banana.forEach(m => {
                console.log(`Name: ${m.name}`);
                console.log(`Display Name: ${m.displayName}`);
                console.log(`Supported Gen Methods: ${m.supportedGenerationMethods}`);
                console.log('---');
            });

            // Also check for image generation methods
            const imageMods = data.models.filter(m =>
                m.supportedGenerationMethods?.includes('imageGeneration') ||
                m.supportedGenerationMethods?.includes('predict')
            );
            console.log('\n--- ALL IMAGE MODELS ---');
            imageMods.forEach(m => console.log(m.name));

        } else {
            console.log('No models found in response:', JSON.stringify(data));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

listModels();
