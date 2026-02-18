
import { createClient } from '@supabase/supabase-js';

// Estas variáveis devem ser configuradas no ambiente da Hostinger (VITE_ prefix)
// Se não houver, usaremos a URL e a Key fornecidas para garantir que o app funcione imediatamente.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ktzextjkiodyfpwxlept.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G4kf1hbg4_VzHdXLL2QMZg_22PsCeDx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
