import { createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://aeixtmqypnwljtljenbl.supabase.co";

const supabaseKey =
  (typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  "sb_publishable_-xdkPT0GjVpYKjgZwDqW1w_BWDDkSkv";

export interface CookieStoreLike {
  getAll(): { name: string; value: string }[];
  set?(name: string, value: string, options?: CookieOptions): void;
  get?(name: string): { name: string; value: string } | undefined;
}

export const createClient = (cookieStore: CookieStoreLike) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (cookieStore.set) {
                cookieStore.set(name, value, options);
              }
            });
          } catch {
            // Can be ignored if called from a server component/middleware
          }
        },
      },
    },
  );
};
