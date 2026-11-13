import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProfile, safeUrl } from '../lib/profile.ts';
import { filterProjects } from '../lib/projects.ts';
test('project and avatar links reject executable and local URLs', () => { for (const url of ['javascript:alert(1)','data:text/html,test','file:///secret','no url',null,{}]) assert.equal(safeUrl(url), ''); assert.equal(safeUrl('https://example.com'), 'https://example.com/'); });
test('saved profile is normalized even when old storage is malformed', () => { assert.equal(normalizeProfile(null).name,'MVPicks'); assert.equal(normalizeProfile({name:'  Builder  ',bio:42,url:'javascript:alert(1)'}).name,'Builder'); assert.equal(normalizeProfile({name:'x'.repeat(100)}).name.length,50); assert.equal(normalizeProfile({url:'file:///private'}).url,''); });
test('search combines category and case-insensitive text and supports empty results', () => { assert.equal(filterProjects('', 'All').length,20); assert.deepEqual(filterProjects('  VELOREN ', 'Games').map(p => p.slug),['veloren']); assert.equal(filterProjects('MVPicks','Games').length,0); assert.equal(filterProjects('zzzz','All').length,0); });

import { previousSeasons } from '../lib/seasons.ts';
import { readFileSync } from 'node:fs';
test('previous seasons have unique years before 2026 and safe project links', () => { assert.equal(new Set(previousSeasons.map(s => s.year)).size, previousSeasons.length); for (const season of previousSeasons) { assert.ok(season.year < 2026); assert.ok(safeUrl(season.url)); } });
test('homepage keeps result and project rendering on dedicated routes', () => { const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8'); assert.ok(!home.includes('ProjectGallery')); assert.ok(!home.includes('Grand prize')); assert.ok(!home.includes('results-list')); assert.ok(home.includes('2026')); const nav = readFileSync(new URL('../components/header.tsx', import.meta.url), 'utf8'); assert.ok(nav.includes('href="/winners"')); assert.ok(nav.includes('href="/seasons"')); assert.ok(!nav.includes('/#results')); });

import { projects, winners } from '../lib/projects.ts';
import { prizes } from '../lib/prizes.ts';
test('expanded collection has exactly three ranked winners and three prizes', () => { assert.equal(projects.length,20); assert.equal(winners.length,3); assert.deepEqual(winners.map(p=>p.rank),['01','02','03']); assert.equal(prizes.length,3); assert.equal(prizes[0].name,'PlayStation 5'); assert.equal(filterProjects('','Tools').length,6); assert.equal(new Set(projects.map(p=>p.slug)).size,projects.length); });

import { seasonProjects, seasonTotals } from '../lib/projects.ts';
test('every season exposes twenty unique projects, three winners, and a higher submission total',()=>{for(const year of [2026,2025]){const list=seasonProjects(year);assert.equal(list.length,20);assert.equal(new Set(list.map(p=>p.slug)).size,20);assert.equal(list.filter(p=>p.rank).length,3);assert.ok(seasonTotals[year]>20);}assert.equal(seasonProjects(2025)[0].slug,'veloren');});

test('only the two retained seasons are exposed',()=>{assert.deepEqual(Object.keys(seasonTotals).sort(),['2025','2026']);assert.deepEqual(previousSeasons.map(s=>s.year),[2025]);});
