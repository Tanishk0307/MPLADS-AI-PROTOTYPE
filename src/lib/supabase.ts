import { createClient } from '@supabase/supabase-js';

const url =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://ugixlrvkdrxllgpcyohi.supabase.co';
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXhscnZrZHJ4bGxncGN5b2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTA4MzIsImV4cCI6MjEwMzU4NjgzMn0.QT1lMxeS05kz-WPygGoB5d072EbHcsynrL6eMSafVKo';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

