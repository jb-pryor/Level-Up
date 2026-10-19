import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

// Mounted at app level so email recovery also works when the household is closed.
// Load the SDK separately from the personal game bundle.
export function useAccount() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void import('../lib/supabase').then(async ({ supabase }) => {
      if (!active) return;
      if (!supabase) { setLoading(false); return; }
      let receivedEvent = false;
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
        receivedEvent = true;
        if (!active) return;
        setSession(next);
        setLoading(false);
        if (event === 'PASSWORD_RECOVERY') setRecovery(true);
        if (event === 'SIGNED_OUT') setRecovery(false);
      });
      unsubscribe = () => subscription.unsubscribe();
      const { data, error: failure } = await supabase.auth.getSession();
      if (!active || receivedEvent) return;
      setSession(data.session);
      setLoading(false);
      if (failure) setError('Your account session could not be restored. Please sign in again.');
    }).catch(() => {
      if (active) { setLoading(false); setError('Could not restore your account. Check your connection.'); }
    });
    return () => { active = false; unsubscribe?.(); };
  }, []);
  return { session, loading, recovery, finishRecovery: () => setRecovery(false), error };
}
export type AccountState = ReturnType<typeof useAccount>;
