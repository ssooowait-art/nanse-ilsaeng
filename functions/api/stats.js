/* GET /api/stats : 오늘의 천하 소식과 묘비 벽. 1분 동안 캐시한다 */
import {init,json,kstDay} from '../../lib/db.js';
export async function onRequestGet(ctx){
  const {request,env}=ctx;const db=env.DB;if(!db)return json({error:'db'},503);
  let cache=null,key=null;
  try{cache=caches.default;key=new Request(new URL('/api/stats',request.url).toString());const hit=await cache.match(key);if(hit)return hit;}catch{cache=null;}
  await init(db);const day=kstDay(),pre=`dc:${day}:`;
  const [tot,td,causes,rare,recent]=await db.batch([
    db.prepare("SELECT n FROM counters WHERE k='all'"),
    db.prepare('SELECT n FROM counters WHERE k=?').bind('d:'+day),
    db.prepare('SELECT k,n FROM counters WHERE k>=? AND k<? ORDER BY n DESC LIMIT 5').bind(pre,`dc:${day};`),
    db.prepare('SELECT name,title,grade,odds,born,died FROM lives WHERE day=? ORDER BY odds DESC LIMIT 3').bind(day),
    db.prepare('SELECT name,born,died,age,region,gun,title,cause,grade FROM lives ORDER BY id DESC LIMIT 12'),
  ]);
  const first=x=>(x.results&&x.results[0]&&x.results[0].n)||0;
  const body={day,total:first(tot),today:first(td),causes:(causes.results||[]).map(x=>[x.k.slice(pre.length),x.n]),rarest:rare.results||[],recent:recent.results||[]};
  const res=json(body,200,{'cache-control':'public, max-age=60'});
  if(cache)ctx.waitUntil(cache.put(key,res.clone()).catch(()=>{}));
  return res;
}
