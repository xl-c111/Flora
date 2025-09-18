import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Backend client with service role (admin access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client for auth verification
export const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY!
);
