/* 난세일생 서버 공용 코드 (Cloudflare Pages Functions + D1, 바인딩 이름 DB) */
export const REGIONS=['유주','기주','청주','연주','예주','서주','사례','병주','량주','형주','양주','익주','교주'];
/* 흔한 것부터 드문 것 순서 */
export const GRADES=['凡','夭','稀','奇','傳','列'];
const TXT=/^[가-힣一-鿿ㄱ-ㅣ0-9·()\s]{1,30}$/u;
export function kstDay(t=Date.now()){return new Date(t+9*3600e3).toISOString().slice(0,10);}
let ready=false;
export async function init(db){
  if(ready)return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS lives(id INTEGER PRIMARY KEY AUTOINCREMENT,ts INTEGER NOT NULL,day TEXT NOT NULL,name TEXT,born INTEGER,died INTEGER,age INTEGER,region TEXT,gun TEXT,status TEXT,title TEXT,cause TEXT,grade TEXT,odds REAL,legend TEXT)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS lives_day_odds ON lives(day,odds)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS counters(k TEXT PRIMARY KEY,n INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS ipt(ip TEXT PRIMARY KEY,ts INTEGER NOT NULL)`),
  ]);
  ready=true;
}
export function json(o,status=200,headers={}){return new Response(JSON.stringify(o),{status,headers:{'content-type':'application/json; charset=utf-8',...headers}});}
/* 손님이 보낸 기록은 믿지 않는다. 정해진 글자와 범위만 받는다 */
export function clean(b){
  if(!b||typeof b!=='object')return null;
  const s=(v,max,opt)=>{if(opt&&(v===''||v==null))return '';return typeof v==='string'&&v.length<=max&&TXT.test(v)?v:null;};
  const i=(v,a,z)=>Number.isInteger(v)&&v>=a&&v<=z?v:null;
  const r={name:s(b.name,8),born:i(b.born,140,200),died:i(b.died,140,330),age:i(b.age,0,110),
    region:REGIONS.includes(b.region)?b.region:null,gun:s(b.gun,8,1),status:s(b.status,8),title:s(b.title,24),cause:s(b.cause,16),
    grade:GRADES.includes(b.grade)?b.grade:null,odds:typeof b.odds==='number'&&isFinite(b.odds)&&b.odds>=1&&b.odds<=1e13?b.odds:null,legend:s(b.legend,6,1)};
  for(const k in r)if(r[k]===null)return null;
  if(r.died-r.born!==r.age)return null;
  return r;
}
export async function ipHash(ip,day){
  const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+'|'+day+'|nanse'));
  return [...new Uint8Array(d)].slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join('');
}
