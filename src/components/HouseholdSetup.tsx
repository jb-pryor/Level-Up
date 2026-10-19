import { HouseholdPanel } from './HouseholdPanel';
import type { HouseholdState } from '../household/useHousehold';
import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import type { AccountState } from '../auth/useAccount';

type Mode = 'signin' | 'signup' | 'forgot';
export function HouseholdSetup({ account, displayName, household }: { account: AccountState; displayName?: string; household: HouseholdState }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const recovery = account.recovery;
  const changeMode = (next: Mode) => { setMode(next); setPassword(''); setConfirm(''); setError(''); setMessage(''); };
  const redirectTo = () => window.location.origin + window.location.pathname;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || busy) return;
    setError(''); setMessage('');
    if ((mode === 'signup' || recovery) && password !== confirm) { setError('Your passwords do not match.'); return; }
    setBusy(true);
    try {
      if (recovery) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword(''); setConfirm(''); account.finishRecovery();
        setMessage('Password updated. You are signed in.');
      } else if (mode === 'signup') {
        const normalized = username.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,24}$/.test(normalized)) throw new Error('Use 3–24 letters, numbers or underscores for your username.');
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: {
          emailRedirectTo: redirectTo(), data: { username: normalized, display_name: (displayName || normalized).trim().slice(0,40) }
        } });
        if (error) throw error;
        setPassword(''); setConfirm('');
        setMessage(data.session ? 'Your account is ready.' : 'Check your email for a confirmation link, then return here to sign in. If you already have an account, sign in instead.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectTo() });
        if (error) throw error;
        setMessage('If an account exists for this email, you will receive a password reset link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword('');
      }
    } catch (failure) {
      const detail = failure instanceof Error ? failure.message : '';
      setError(/database error saving new user/i.test(detail)
        ? 'Account creation failed. This username may already be taken. Try another username; if it continues, check the Supabase Auth logs.'
        : detail || 'Could not connect. Please try again.');
    } finally { setBusy(false); }
  };
  const signOut = async () => {
    if (!supabase || busy) return;
    setBusy(true); setError(''); setMessage('');
    try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error) throw error; }
    catch { setError('Could not sign out. Check your connection and try again.'); }
    finally { setBusy(false); }
  };
  if (!supabase) return <p role="alert">Household connection settings are missing. Save .env.local and restart the development server.</p>;
  if (account.loading) return <p role="status">Loading your account…</p>;
  return <div className="household-account">
    <span className="eyebrow">YOUR NEXT SHARED ADVENTURE</span>
    <h3>{recovery ? 'Choose a new password.' : account.session ? 'Your party awaits.' : mode === 'signup' ? 'Create your account.' : mode === 'forgot' ? 'Forgot your password?' : 'Welcome to your party.'}</h3>
    {(error || account.error) && <p className="account-error" role="alert">{error || account.error}</p>}
    {message && <p className="household-connection" role="status">{message}</p>}
    {account.session && !recovery ? <>
      <p>Signed in as <strong>@{String(account.session.user.user_metadata.username || 'player')}</strong>.</p>
      <p>Your player name remains {displayName ? <strong>{displayName}</strong> : 'independent of your username'}. Your character and progress are still saved in this browser.</p>
      <HouseholdPanel key={account.session.user.id} state={household} userId={account.session.user.id}/>
      <button className="quiet-button" disabled={busy} onClick={signOut}>{busy ? 'Signing out…' : 'Sign out'}</button>
    </> : <>
      {!recovery && <p>{mode === 'signup' ? 'Choose a unique username. Your player name can stay exactly as it is.' : mode === 'forgot' ? 'We’ll email you a link to choose a new password.' : 'Sign in with your email and password to use your account.'}</p>}
      <form className="account-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          {mode === 'signup' && !recovery && <label>Username<input required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={e=>setUsername(e.target.value)}/><small>3–24 letters, numbers or underscores. Usernames ignore capitalization.</small></label>}
          {!recovery && <label>Email<input required type="email" autoComplete="email" autoCapitalize="none" value={email} onChange={e=>setEmail(e.target.value)}/></label>}
          {(recovery || mode !== 'forgot') && <label>{recovery ? 'New password' : 'Password'}<input required type="password" minLength={mode === 'signup' || recovery ? 8 : undefined} autoComplete={recovery || mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/>{(mode === 'signup' || recovery) && <small>Use at least 8 characters.</small>}</label>}
          {(recovery || mode === 'signup') && <label>Confirm password<input required type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}
          <button className="primary" type="submit">{busy ? 'Please wait…' : recovery ? 'Save password' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in'}</button>
        </fieldset>
      </form>
      {!recovery && <div className="account-links"><button className="quiet-button" disabled={busy} onClick={()=>changeMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Already registered? Sign in' : 'Create account'}</button>{mode !== 'forgot' && <button className="account-text-button" disabled={busy} onClick={()=>changeMode('forgot')}>Forgot password?</button>}{mode === 'forgot' && <button className="account-text-button" disabled={busy} onClick={()=>changeMode('signin')}>Back to sign in</button>}</div>}
      <p className="muted account-note">Email is used for account confirmation and recovery. Task reminder emails are not enabled.</p>
    </>}
  </div>;
}
