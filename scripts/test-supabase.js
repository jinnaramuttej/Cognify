
const { createClient } = require('@supabase/supabase-js');

// Bun automatically loads .env files, but let's be explicit if needed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Environment Check ---');
console.log('SUPABASE_URL:', supabaseUrl ? 'FOUND' : 'MISSING');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'FOUND' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log(`\nTesting connection to: ${supabaseUrl}`);

    try {
        // Try to get a simple version or something basic
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Query failed:', error.message);
            console.error('Error details:', JSON.stringify(error, null, 2));

            if (error.message.includes('schema cache')) {
                console.log('\nTIP: This often means the Supabase project is paused or the database is still initializing.');
            }
        } else {
            console.log('Connection successful! Database is reachable.');
            console.log('Count of profiles:', data);
        }

        // Also test Auth
        console.log('\nTesting Auth API...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('Auth check failed:', authError.message);
        } else {
            console.log('Auth API is reachable!');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
