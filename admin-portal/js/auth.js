console.log('AUTH MODULE START (v102)');

const SUPABASE_URL = window.YardGuardConfig ? window.YardGuardConfig.SUPABASE_URL : null;
// Using Service Role Key from config
const SUPABASE_KEY = window.YardGuardConfig ? window.YardGuardConfig.SUPABASE_SERVICE_ROLE_KEY : null;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('CRITICAL: YardGuardConfig (SUPABASE_URL/SUPABASE_KEY) missing! Check config.js');
}

if (window.log) window.log('Auth: Initializing with Service Key (REAL God Mode)...');
else console.log('Auth: Initializing with Service Key (REAL God Mode)...');

// Fallback logic for createClient
let createClientFn;
if (window.supabase && window.supabase.createClient) {
    createClientFn = window.supabase.createClient;
} else if (typeof window.supabase === 'function') {
    createClientFn = window.supabase;
} else {
    console.error('Supabase client library not found');
    // If UMD isn't loaded, try dynamic import fallback?
    // But index.html usually loads it.
}

// Initialize with Service Role Key
export const supabase = createClientFn(SUPABASE_URL, SUPABASE_KEY);

/**
 * Check if user is authenticated and redirect if not
 * MOCKED for "God Mode"
 */
export async function checkAuth() {
    console.log('checkAuth: Bypassed (God Mode active). returning mock session.');

    // Return a mocked session object that mimics a real user
    // Using the real admin UUID to satisfy foreign key constraints if needed
    return {
        session: {
            user: {
                id: '77262f75-da5d-48a3-ab21-e218033071d3',
                email: 'admin@yardguard.com',
                role: 'service_role' // Explicitly set role
            },
            access_token: 'mock-token',
            expires_at: Math.floor(Date.now() / 1000) + 3600
        },
        profile: {
            id: '77262f75-da5d-48a3-ab21-e218033071d3',
            email: 'admin@yardguard.com',
            role: 'admin'
        }
    };
}

export async function logout() {
    console.log('Logout clicked (God Mode no-op). Redirecting to login anyway.');
    window.location.href = 'login.html';
}
