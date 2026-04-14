import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		// The app primarily uses local auth in dev; disable background refresh calls
		// to prevent repeated DNS/network noise when Supabase is unreachable.
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false,
	},
});
