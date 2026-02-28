import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hisfkvefcrhioodanjjh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2ZrdmVmY3JoaW9vZGFuampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjU4NjgsImV4cCI6MjA4NzgwMTg2OH0.S_hvT5scliKpBL3haV-MrfeC7RLUwsxAkVS8Cff5Hto'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)