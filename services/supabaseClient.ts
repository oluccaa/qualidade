
import { createClient } from '@supabase/supabase-js';

// Em um ambiente real, estas chaves viriam de process.env ou import.meta.env
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
