// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://filpcldulczpmlgiickk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbHBjbGR1bGN6cG1sZ2lpY2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5MjAzMzIsImV4cCI6MjA1MjQ5NjMzMn0.46rH7r2RVgtea_TrgRhCpCLqypXsZAPU2CamrkLJs3Y";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);