import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL) ||
  ((import.meta as any).env?.VITE_SUPABASE_URL) ||
  "https://aeixtmqypnwljtljenbl.supabase.co";

const supabaseKey =
  (typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  "sb_publishable_-xdkPT0GjVpYKjgZwDqW1w_BWDDkSkv";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
