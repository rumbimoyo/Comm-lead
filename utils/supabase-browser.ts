import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton instance - only ONE client per browser tab
let supabaseClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  // Return existing client if already created (singleton pattern)
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new client only once - no custom fetch
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseClient;
}

// Export a pre-created client for direct imports
export const supabaseBrowser = createSupabaseBrowserClient();
