import Link from 'next/link';
export function ParticipantNav(){return <nav className="participant-nav" aria-label="Your account"><Link href="/dashboard">My projects</Link><Link href="/submit">Submit a project</Link><Link href="/claims">Prizes & delivery</Link><Link href="/profile">Profile settings</Link></nav>;}
