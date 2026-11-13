import { createAccount, db } from '../lib/accounts.ts';
import { randomBytes } from 'node:crypto';
const email=process.env.NEXUS_SEED_EMAIL || 'luciferispro69@gmail.com';
if(db().prepare('SELECT id FROM accounts WHERE email=?').get(email)) { console.log('Preloaded account already exists; password unchanged.'); }
else { const password='Nexus-'+randomBytes(9).toString('base64url'); createAccount(email,password,'MVPicks',true); console.log(`Account: ${email}\nPassword: ${password}`); }

// Ensure a freshly seeded account also receives its existing event submission immediately.
db().prepare("INSERT OR IGNORE INTO submissions(account_id,catalog_slug,title,description,category,url,repository,season,status,winner,updated) SELECT id,'mvpicks','MVPicks','A free-to-play esports prediction platform for BGMI, VALORANT, and CS2. Predict outcomes, earn virtual points, and compete without money wagering.','Esports',url,'',2026,'submitted',1,? FROM accounts WHERE email=?").run(Date.now(),email);
