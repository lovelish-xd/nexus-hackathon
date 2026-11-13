import Link from 'next/link';
import { db } from '../lib/accounts';
import { currentAccount } from '../lib/auth';
import { safeUrl } from '../lib/profile';
export async function ProjectVisit() { const owner=db().prepare('SELECT url FROM accounts WHERE owner=1 LIMIT 1').get() as {url:string}|undefined; const url=safeUrl(owner?.url); if(url) return <a className="button primary" href={url} target="_blank" rel="noopener noreferrer">Visit MVPicks ↗</a>; const account=await currentAccount(); return account?.owner ? <Link className="button primary" href="/dashboard">Manage your project link ↗</Link> : <p className="project-link-pending">Live project link coming soon.</p>; }
