'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, createAccount, createSession, revokeSession, verifyPassword, validCredentials, allowAttempt } from '../lib/accounts';
import { cookieName, currentAccount } from '../lib/auth';
import { normalizeProfile, safeUrl } from '../lib/profile';
export type FormState = { error: string; success?: string };
async function signInAccount(id: number) { const jar=await cookies(); const old=jar.get(cookieName)?.value; if(old) revokeSession(old); jar.set(cookieName,createSession(id),{httpOnly:true,sameSite:'lax',secure:process.env.NEXUS_HTTPS === 'true',path:'/',maxAge:7*86400}); revalidatePath('/','layout'); }
export async function authenticate(mode: 'signin' | 'signup', _previous: FormState, form: FormData): Promise<FormState> {
  const email=String(form.get('email') || '').trim().toLowerCase(); const password=String(form.get('password') || ''); const name=String(form.get('name') || '').trim();
  if (!validCredentials(email,password)) return {error:'Enter a valid email and a password between 10 and 128 characters.'};
  if (mode === 'signup' && (!name || name.length > 50)) return {error:'Enter a name of up to 50 characters.'};
  let id: number;
  try {
    if (!allowAttempt('global',60) || !allowAttempt(email)) return {error:'Too many attempts. Try again in 15 minutes.'};
    const account=db().prepare('SELECT id,password FROM accounts WHERE email=?').get(email) as {id:number;password:string} | undefined;
    if(mode === 'signup') { if(account) return {error:'Unable to create this account. Try signing in instead.'}; id=createAccount(email,password,name); }
    else { if(!account || !verifyPassword(password,account.password)) return {error:'Email or password is incorrect.'}; id=account.id; }
    await signInAccount(id);
  } catch { return {error:'Unable to access your account right now. Please try again.'}; }
  redirect('/dashboard');
}
export async function signOut() { const jar=await cookies(); const token=jar.get(cookieName)?.value; if(token) revokeSession(token); jar.delete(cookieName); revalidatePath('/','layout'); redirect('/sign-in'); }
export async function saveProfile(_previous: FormState, form: FormData): Promise<FormState> {
  const account=await currentAccount(); if(!account) return {error:'Please sign in again to save your profile.'};
  const data=Object.fromEntries(form); const name=String(data.name || '').trim();
  if(!name || name.length>50 || String(data.bio || '').length>300) return {error:'Use a name up to 50 characters and a bio up to 300 characters.'};
  if(['avatar','url'].some(field=>data[field] && !safeUrl(data[field]))) return {error:'Use an http or https URL for your avatar and project.'};
  const next=normalizeProfile(data);
  try { db().prepare('UPDATE accounts SET name=?,bio=?,avatar=?,url=? WHERE id=?').run(next.name,next.bio,next.avatar,account.owner ? next.url : account.url,account.id); } catch { return {error:'Could not save your profile. Please try again.'}; }
  if(account.owner) db().prepare("UPDATE submissions SET url=? WHERE account_id=? AND catalog_slug='mvpicks'").run(next.url,account.id);
  revalidatePath('/','layout'); return {error:'',success:'Profile saved. You’re all set.'};
}
