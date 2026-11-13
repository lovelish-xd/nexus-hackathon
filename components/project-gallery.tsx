'use client';
import { useState } from 'react';
import Link from 'next/link';
import { filterProjects } from '../lib/projects';
import { Artwork } from './artwork';
export function ProjectGallery({year = 2026}: {year?:number}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const visible = filterProjects(query, category, year);
  return <><div className="gallery-controls"><div className="filters" aria-label="Project categories">{['All', 'Esports', 'Games', 'Tools'].map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === 'All' ? 'All projects' : item}</button>)}</div><label className="search"><span>⌕</span><input type="search" aria-label="Search projects" placeholder="Find your next inspiration" value={query} onChange={event => setQuery(event.target.value)} /></label></div><div className="project-grid">{visible.map(project => <Link href={`/projects/${project.slug}?season=${year}`} className="project-card" key={project.slug}><div className="card-image"><Artwork slug={project.slug}/>{project.award ? <span className="award-label">{project.rank === '01' ? '✦ ' : ''}{project.award}</span> : null}</div><div className="card-meta"><span>{project.type}</span><span>↗</span></div><h3>{project.name}</h3><p>{project.description}</p><div className="card-credit">{project.creator}<span>View project →</span></div></Link>)}</div>{visible.length === 0 ? <div className="empty-state"><h3>No builds found.</h3><p>Try another search or explore all categories.</p><button className="button secondary" onClick={() => {setQuery('');setCategory('All');}}>Reset filters</button></div> : null}<p className="result-count" aria-live="polite">Showing {visible.length} of 20 selected projects</p></>;
}
