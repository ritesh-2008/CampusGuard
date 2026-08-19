import { createClient } from "@supabase/supabase-js";

// The backend should use the service_role key (not the anon key) so it
// bypasses Row-Level Security when inserting / updating incidents.
// Fall back to SUPABASE_KEY if the dedicated variable is not set.
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

export const Supabase = createClient(
    process.env.SUPABASE_URL,
    key
);