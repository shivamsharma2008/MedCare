import { createClient } from "@supabase/supabase-js";

// ============================================================================
// 1. SUPABASE PROJECT URL (Do NOT include /rest/v1/)
// ============================================================================
const SUPABASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL)) ||
  "https://aeixtmqypnwljtljenbl.supabase.co";

// ============================================================================
// 2. SUPABASE PUBLIC KEY (ANON / PUBLISHABLE KEY)
// ============================================================================
const SUPABASE_PUBLIC_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  "sb_publishable_-xdkPT0GjVpYKjgZwDqW1w_BWDDkSkv";

// Sanitize URL to ensure no trailing slash or /rest/v1
const cleanUrl = String(SUPABASE_URL)
  .trim()
  .replace(/^["']|["']$/g, "")
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");

const cleanKey = String(SUPABASE_PUBLIC_KEY)
  .trim()
  .replace(/^["']|["']$/g, "");

// Single shared Supabase client for the entire application
export const supabase = createClient(cleanUrl, cleanKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
