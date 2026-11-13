'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { currentAccount } from '../lib/auth';
import { saveSubmission, requestPrize } from '../lib/participation';
import type { FormState } from './auth-actions';
export async function saveProject(_state:FormState,form:FormData):Promise<FormState> {
 const account=await currentAccount();if(!account)return {error:'Sign in to save your project.'};
 const raw=String(form.get('id')||'');const id=raw?Number(raw):null;if(raw && (!Number.isSafeInteger(id)||Number(id)<1))return {error:'Invalid project.'};
 let saved:number;
 try { saved=saveSubmission(account.id,id,Object.fromEntries(form),form.get('intent')==='submit'); }
 catch(error){return {error:error instanceof Error && !('code' in error) ? error.message : 'Could not save your project. Please try again.'};}
 revalidatePath('/dashboard');revalidatePath('/projects/mvpicks');redirect(`/submissions/${saved}?saved=1`);
}
export async function claimPrize(_state:FormState,form:FormData):Promise<FormState> {
 const account=await currentAccount();if(!account)return {error:'Sign in to request your prize.'};
 try{requestPrize(account.id,Object.fromEntries(form));}catch(error){return {error:error instanceof Error && !('code' in error) ? error.message : 'Could not save your delivery details. Please try again.'};}
 revalidatePath('/claims');revalidatePath('/dashboard');return {error:'',success:'Claim requested. Delivery details received; dispatch confirmation is pending.'};
}
