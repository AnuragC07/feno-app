// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔧 Supabase Config:", {
    url: supabaseUrl ? "✅ Loaded" : "❌ Missing",
    key: supabaseAnonKey ? "✅ Loaded" : "❌ Missing"
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
    }
});
