import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects, seasonProjects } from '../../../lib/projects';
import { Artwork } from '../../../components/artwork';
import { ProjectVisit } from '../../../components/project-visit';
export function generateStaticParams() { return projects.map(project => ({slug: project.slug})); }
export async function generateMetadata({params}: {params: Promise<{slug: string}>}) { const {slug} = await params; return { title: projects.find(project => project.slug === slug)?.name || 'Project not found' }; }
export default async function ProjectPage({params,searchParams}: {params: Promise<{slug: string}>;searchParams:Promise<{season?:string}>}) {
  const {slug} = await params;
  const query=await searchParams; const year=[2026,2025].includes(Number(query.season)) ? Number(query.season) : 2026;
  const project = seasonProjects(year).find(item => item.slug === slug);
  if (!project) notFound();
  return <main id="main" className="shell page-main"><Link href={`/projects?season=${year}`} className="back-link">← All projects</Link><div className="detail-heading"><div><span className="eyebrow">{project.type}</span><h1 className="page-title">{project.name}</h1><p className="page-intro">{project.tagline}</p></div>{project.award ? <div className="detail-award"><span>✦</span><b>{project.award}</b><small>NEXUS · SEASON {year}</small></div> : <span className="eyebrow">{year} PROJECT COLLECTION</span>}</div><div className="detail-art"><Artwork slug={project.slug} large/></div><div className="detail-content"><section><span className="eyebrow">BEHIND THE BUILD</span><h2>{project.tagline}</h2><p>{project.description}</p><p>{project.detail}</p><ul>{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul></section><aside><span className="eyebrow">EXPLORE THE PROJECT</span><h3>See it in action.</h3><p>{project.slug === 'mvpicks' ? 'Explore the live build when its creator shares the project link.' : `Visit the official ${project.name} website to discover more.`}</p>{project.slug === 'mvpicks' ? <ProjectVisit/> : <a className="button primary" href={project.url} target="_blank" rel="noopener noreferrer">Visit {project.name} ↗</a>}<div className="detail-credit">Built by {project.slug === 'mvpicks' ? <Link href="/profile">the MVPicks builder ↗</Link> : project.creator}</div></aside></div></main>;
}
