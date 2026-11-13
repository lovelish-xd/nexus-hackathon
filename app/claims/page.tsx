import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentAccount } from '../../lib/auth';
import { eligibleWinner,myClaim } from '../../lib/participation';
import { ParticipantNav } from '../../components/participant-nav';
import { ClaimForm } from '../../components/claim-form';
export const metadata={title:'Prizes & delivery'};
export default async function Claims(){const account=await currentAccount();if(!account)redirect('/sign-in');const winner=eligibleWinner(account.id),claim=myClaim(account.id);return <main id="main" className="shell page-main"><ParticipantNav/><span className="eyebrow">YOUR REWARDS</span><h1 className="page-title">Prizes & delivery.</h1>{winner?<><div className="prize-claim-summary"><img src="/images/prize-ps5-dark.png" alt="PlayStation 5"/><div><span className="eyebrow">2026 GRAND PRIZE · {winner.title}</span><h2>Your PlayStation 5 awaits.</h2><p>{claim?'Claim requested · Dispatch confirmation pending':'Eligible to claim · Delivery details required'}</p><p>Submit your shipping details so the organizer can arrange delivery. No payment is required.</p></div></div><ClaimForm claim={claim}/></>:<div className="empty-state"><h2>No prizes to claim yet.</h2><p>Prize delivery becomes available when one of your submitted projects receives a winning placement.</p><Link className="button primary" href="/dashboard">View my projects ↗</Link></div>}</main>;}
