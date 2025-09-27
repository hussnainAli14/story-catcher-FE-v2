import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dceitppbffegzhxnywcb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWl0cHBiZmZlZ3poeG55d2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg4NzksImV4cCI6MjA3NDU1NDg3OX0.vXpIyt-PoJYsIt0WDfRiFGeW4JyRhf6w-RswgcGLLBU'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
