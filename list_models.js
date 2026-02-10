
const fetch = globalThis.fetch;
const GOOGLE_AI_API_KEY = 'AIzaSyD9_lIfxnD6pjdC2jaXneLJ6fblUo-Pnw0';

async function listModels() {
    console.log('Listing available models...');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_AI_API_KEY}`);
        const data = await response.json();

        if (data.models) { // Correct structure check
            console.log('Found models:', data.models.length);
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.error('Error fetching models:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

listModels();
