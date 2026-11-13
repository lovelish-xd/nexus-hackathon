import { redirect } from 'next/navigation';
import { currentAccount } from '../../lib/auth';
import { AuthForm } from '../../components/auth-form';
export const metadata = { title: 'Sign up' };
export default async function Page() { if(await currentAccount()) redirect('/dashboard'); return <main id="main" className="shell page-main"><AuthForm mode="signup"/></main>; }
