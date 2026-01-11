
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase configurado com as credenciais fornecidas.
 * O SDK gerencia automaticamente o armazenamento do token de sessão 
 * (Cookie/LocalStorage dependendo do ambiente) e o recupera em novas sessões.
 */

const SUPABASE_URL = 'https://wtydnzqianhahiiasows.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_G-talSR4UyXl42B2jzglow_EB0ainxc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
