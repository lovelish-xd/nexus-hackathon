import type { Metadata } from 'next';
import { Header, Footer } from '../components/header';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Nexus — Gaming Hackathon', template: '%s | Nexus' }, description: 'An annual hackathon for games, esports, and gaming tools. Explore Nexus, the 2026 season, and previous editions.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header/>{children}<Footer/></body></html>; }
