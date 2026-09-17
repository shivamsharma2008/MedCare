import { createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://aeixtmqypnwljtljenbl.supabase.co";

const supabaseKey =
  (typeof process !== "undefined" && (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  "sb_publishable_-xdkPT0GjVpYKjgZwDqW1w_BWDDkSkv";

export interface RequestLike {
  cookies: {
    getAll(): { name: string; value: string }[];
    set(name: string, value: string): void;
    get?(name: string): { name: string; value: string } | undefined;
  };
  headers?: any;
}

export interface ResponseLike {
  cookies: {
    set(name: string, value: string, options?: CookieOptions): void;
  };
}

export const createClient = (request: RequestLike, response?: ResponseLike) => {
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          if (response) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          }
        },
      },
    },
  );

  return supabase;
};
