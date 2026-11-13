import { db } from './accounts.ts';
import { safeUrl } from './profile.ts';
export type Submission = {id:number;account_id:number;catalog_slug:string|null;title:string;description:string;category:string;url:string;repository:string;season:number;status:string;winner:number;updated:number};
export type Claim = {account_id:number;submission_id:number;recipient:string;phone:string;line1:string;line2:string;city:string;region:string;postal:string;country:string;status:string;updated:number};
export const categories=['Games','Esports','Tools','Mods'];
export function mySubmissions(accountId:number):Submission[] { return (db().prepare('SELECT * FROM submissions WHERE account_id=? ORDER BY updated DESC,id DESC').all(accountId) as Submission[]).map(row=>({...row})); }
export function ownedSubmission(accountId:number,id:number):Submission|null { const row=db().prepare('SELECT * FROM submissions WHERE id=? AND account_id=?').get(id,accountId) as Submission|undefined;return row?{...row}:null; }
export function saveSubmission(accountId:number,id:number|null,input:Record<string,unknown>,submit:boolean) {
  const title=String(input.title||'').trim(),description=String(input.description||'').trim(),category=String(input.category||'');
  const rawUrl=String(input.url||'').trim(),rawRepository=String(input.repository||'').trim();
  if(!title || title.length>80) throw new Error('Enter a project name of up to 80 characters.');
  if(description.length>3000 || (submit && description.length<40)) throw new Error('Submitted projects need a description of 40–3000 characters.');
  if(!categories.includes(category)) throw new Error('Choose a project category.');
  if((rawUrl && !safeUrl(rawUrl)) || (rawRepository && !safeUrl(rawRepository)) || rawUrl.length>2000 || rawRepository.length>2000) throw new Error('Use valid http or https links.');
  const previous=id ? ownedSubmission(accountId,id) : null;
  if(id && !previous) throw new Error('Project not found.');
  if((submit || previous?.status==='submitted') && !rawUrl && !rawRepository && !previous?.winner) throw new Error('Add a live project, walkthrough, or repository link before submitting.');
  const status=submit || previous?.status==='submitted' ? 'submitted' : 'draft';
  if(id) db().prepare('UPDATE submissions SET title=?,description=?,category=?,url=?,repository=?,status=?,updated=? WHERE id=? AND account_id=?').run(title,description,category,safeUrl(rawUrl),safeUrl(rawRepository),status,Date.now(),id,accountId);
  else id=Number(db().prepare('INSERT INTO submissions(account_id,title,description,category,url,repository,status,updated) VALUES (?,?,?,?,?,?,?,?)').run(accountId,title,description,category,safeUrl(rawUrl),safeUrl(rawRepository),status,Date.now()).lastInsertRowid);
  if(previous?.catalog_slug==='mvpicks') db().prepare('UPDATE accounts SET url=? WHERE id=?').run(safeUrl(rawUrl),accountId);
  return id;
}
export function eligibleWinner(accountId:number):Submission|null { const row=db().prepare("SELECT * FROM submissions WHERE account_id=? AND winner=1 AND status='submitted' AND season=2026 LIMIT 1").get(accountId) as Submission|undefined;return row?{...row}:null; }
export function myClaim(accountId:number):Claim|null { const row=db().prepare('SELECT * FROM prize_claims WHERE account_id=?').get(accountId) as Claim|undefined;return row?{...row}:null; }
export function requestPrize(accountId:number,input:Record<string,unknown>) {
  const winner=eligibleWinner(accountId);if(!winner)throw new Error('Prize claims are available to eligible winning submissions.');
  const fields=['recipient','phone','line1','line2','city','region','postal','country'] as const;
  const values=Object.fromEntries(fields.map(field=>[field,String(input[field]||'').trim()]));
  if(fields.some(field=>field!=='line2' && !values[field]) || fields.some(field=>values[field].length>200)) throw new Error('Complete every required delivery field using up to 200 characters each.');
  if(!/^[+()\d\s.-]{7,30}$/.test(values.phone) || values.phone.replace(/\D/g,'').length<7) throw new Error('Enter a valid delivery phone number.');
  if(input.consent!=='on')throw new Error('Confirm that these details can be used to arrange prize delivery.');
  const previous=myClaim(accountId);if(previous && previous.status!=='requested')throw new Error('Delivery is being arranged. Contact the organizer to change these details.');
  db().prepare(`INSERT INTO prize_claims(account_id,submission_id,recipient,phone,line1,line2,city,region,postal,country,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(account_id) DO UPDATE SET recipient=excluded.recipient,phone=excluded.phone,line1=excluded.line1,line2=excluded.line2,city=excluded.city,region=excluded.region,postal=excluded.postal,country=excluded.country,updated=excluded.updated`).run(accountId,winner.id,...fields.map(field=>values[field]),Date.now());
}
