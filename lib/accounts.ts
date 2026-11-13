import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
export type Account = { id: number; email: string; name: string; bio: string; avatar: string; url: string; owner: number };
let database: DatabaseSync | undefined;
export function db() {
  if (!database) {
    const file = process.env.NEXUS_DB_PATH || join(process.cwd(), '.data', 'nexus.sqlite');
    mkdirSync(dirname(file), { recursive: true });
    database = new DatabaseSync(file);
    database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, bio TEXT NOT NULL DEFAULT '', avatar TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', owner INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, account_id INTEGER NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL, catalog_slug TEXT UNIQUE, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, url TEXT NOT NULL DEFAULT '', repository TEXT NOT NULL DEFAULT '', season INTEGER NOT NULL DEFAULT 2026, status TEXT NOT NULL DEFAULT 'draft', winner INTEGER NOT NULL DEFAULT 0, updated INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS prize_claims (account_id INTEGER PRIMARY KEY, submission_id INTEGER NOT NULL UNIQUE, recipient TEXT NOT NULL, phone TEXT NOT NULL, line1 TEXT NOT NULL, line2 TEXT NOT NULL, city TEXT NOT NULL, region TEXT NOT NULL, postal TEXT NOT NULL, country TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'requested', updated INTEGER NOT NULL);
      INSERT OR IGNORE INTO submissions(account_id,catalog_slug,title,description,category,url,repository,season,status,winner,updated)
      SELECT id,'mvpicks','MVPicks','A free-to-play esports prediction platform for BGMI, VALORANT, and CS2. Predict results, earn virtual points, and compete on leaderboards. No money wagering or cash conversion.','Esports',url,'',2026,'submitted',1,CAST(strftime('%s','now') AS INTEGER)*1000 FROM accounts WHERE owner=1 ORDER BY id LIMIT 1;`);
  }
  return database;
}
export function passwordHash(password: string) { const salt = randomBytes(16).toString('hex'); return salt + ':' + scryptSync(password, salt, 64).toString('hex'); }
export function verifyPassword(password: string, stored: string) { const [salt, hash] = stored.split(':'); if (!salt || !hash || hash.length !== 128) return false; return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex')); }
export function validCredentials(email: string, password: string) { return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 10 && password.length <= 128; }
export function createAccount(email: string, password: string, name: string, owner = false) {
  email = email.trim().toLowerCase(); name = name.trim();
  if (!validCredentials(email, password) || !name || name.length > 50) throw new Error('Invalid account details');
  const result = db().prepare('INSERT INTO accounts (email,password,name,owner) VALUES (?,?,?,?)').run(email,passwordHash(password),name,Number(owner));
  return Number(result.lastInsertRowid);
}
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export function createSession(accountId: number) { const token = randomBytes(32).toString('hex'); db().prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now()); db().prepare('INSERT INTO sessions VALUES (?,?,?)').run(tokenHash(token),accountId,Date.now()+7*86400000); return token; }
export function accountForSession(token: string | undefined) { if (!token || !/^[a-f0-9]{64}$/.test(token)) return null; const row = db().prepare('SELECT a.id,a.email,a.name,a.bio,a.avatar,a.url,a.owner FROM accounts a JOIN sessions s ON a.id=s.account_id WHERE s.token=? AND s.expires>?').get(tokenHash(token),Date.now()) as Account | undefined; return row ? {...row} : null; }
export function revokeSession(token: string) { db().prepare('DELETE FROM sessions WHERE token=?').run(tokenHash(token)); }
export function allowAttempt(key: string, max = 8) { const now=Date.now(); db().prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset < ? THEN 1 ELSE count+1 END, reset=CASE WHEN reset < ? THEN excluded.reset ELSE reset END').run(key,now+15*60000,now,now); return (db().prepare('SELECT count FROM attempts WHERE key=?').get(key) as {count:number}).count <= max; }
