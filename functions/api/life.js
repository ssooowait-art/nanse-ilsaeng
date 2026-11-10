/* POST /api/life : 한 사람의 생애를 기록하고, 오늘 천하에서 몇 번째인지 돌려준다 */
import {init,json,clean,kstDay,ipHash,GRADES} from '../../lib/db.js';
export async function onRequestPost({request,env}){
  const db=env.DB;if(!db)return json({error:'db'},503);
  let b;try{b=await request.json();}catch{return json({error:'json'},400);}
  const r=clean(b);if(!r)return json({error:'invalid'},400);
  await init(db);
  const now=Date.now(),day=kstDay(now);
  const ip=await ipHash(request.headers.get('cf-connecting-ip')||'0',day);
  const last=await db.prepare('SELECT ts FROM ipt WHERE ip=?').bind(ip).first();
  const limited=!!(last&&now-last.ts<20000); /* 같은 곳에서 20초 안에 또 오면 세지 않는다 */
  if(!limited){
    const up='INSERT INTO counters(k,n) VALUES(?,1) ON CONFLICT(k) DO UPDATE SET n=n+1';
    await db.batch([
      db.prepare('INSERT INTO lives(ts,day,name,born,died,age,region,gun,status,title,cause,grade,odds,legend) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(now,day,r.name,r.born,r.died,r.age,r.region,r.gun,r.status,r.title,r.cause,r.grade,r.odds,r.legend),
      db.prepare(up).bind('all'),db.prepare(up).bind('d:'+day),db.prepare(up).bind('c:'+r.cause),
      db.prepare(up).bind(`dc:${day}:${r.cause}`),db.prepare(up).bind(`dg:${day}:${r.grade}`),
      db.prepare('INSERT INTO ipt(ip,ts) VALUES(?,?) ON CONFLICT(ip) DO UPDATE SET ts=excluded.ts').bind(ip,now),
    ]);
  }
  const higher=GRADES.slice(GRADES.indexOf(r.grade)+1);
  const keys=['d:'+day,`dc:${day}:${r.cause}`,'c:'+r.cause,...higher.map(g=>`dg:${day}:${g}`)];
  const rows=(await db.prepare(`SELECT k,n FROM counters WHERE k IN (${keys.map(()=>'?').join(',')})`).bind(...keys).all()).results||[];
  const m=Object.fromEntries(rows.map(x=>[x.k,x.n]));
  return json({today:m['d:'+day]||0,sameToday:m[`dc:${day}:${r.cause}`]||0,sameAll:m['c:'+r.cause]||0,
    rarer:higher.reduce((a,g)=>a+(m[`dg:${day}:${g}`]||0),0),counted:!limited});
}
