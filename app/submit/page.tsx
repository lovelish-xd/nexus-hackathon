import { redirect,notFound } from 'next/navigation';
import { currentAccount } from '../../lib/auth';
import { ownedSubmission } from '../../lib/participation';
import { ParticipantNav } from '../../components/participant-nav';
import { SubmissionForm } from '../../components/submission-form';
export const metadata={title:'Submit a project'};
export default async function Submit({searchParams}:{searchParams:Promise<{id?:string}>}){const account=await currentAccount();if(!account)redirect('/sign-in');const {id}=await searchParams;const project=id?ownedSubmission(account.id,Number(id)):null;if(id&&!project)notFound();return <main id="main" className="shell page-main"><ParticipantNav/><span className="eyebrow">NEXUS · SEASON 2026</span><h1 className="page-title">{project?'Refine your build.':'Make your move.'}</h1><p className="page-intro">{project?.status==='submitted'?'Your project is submitted. Changes update the same submission.':'Save a draft while you build, then submit when your project is ready.'}</p><SubmissionForm project={project}/></main>;}
