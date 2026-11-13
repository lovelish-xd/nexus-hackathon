import { cookies } from 'next/headers';
import { accountForSession } from './accounts';
export const cookieName = 'nexus_session';
export async function currentAccount() { return accountForSession((await cookies()).get(cookieName)?.value); }
