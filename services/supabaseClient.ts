import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase configurado via variáveis de ambiente.
 */

// .env

// VITE_SUPABASE_URL=https://wtydnzqianhahiiasows.supabase.co
// VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_G-talSR4UyXl42B2jzglow_EB0ainxc



const supabaseUrl = "https://wtydnzqianhahiiasows.supabase.co";
const supabaseKey = "sb_publishable_G-talSR4UyXl42B2jzglow_EB0ainxc";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Configuração do Supabase ausente. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.");
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default supabase;