import { ParticipantNav } from '../../components/participant-nav';
import { redirect } from 'next/navigation';
import { currentAccount } from '../../lib/auth';
import { ProfileEditor } from '../../components/profile-editor';
export const metadata = { title: 'Your profile' };
export default async function ProfilePage() { const account=await currentAccount(); if(!account) redirect('/sign-in'); return <main id="main" className="shell page-main"><ParticipantNav/><span className="eyebrow">YOUR CORNER OF NEXUS</span><h1 className="page-title">Behind every build.</h1><p className="page-intro">There’s a person who saw things differently. This is you.</p><ProfileEditor account={account}/></main>; }
