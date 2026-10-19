import { createClient } from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL?.trim();
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
// Never log configuration values. Only the publishable browser key belongs here.
const valid=!!url&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)&&!!key&&key.startsWith('sb_publishable_');
export const supabase=valid?createClient(url!,key!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
