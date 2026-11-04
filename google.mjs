import {randomBytes} from 'node:crypto';
const base='http://127.0.0.1:4310';
const callback=base+'/google/callback';
const states=new Map(),sessions=new Map();
const tokenUrl='https://oauth2.googleapis.com/token';
const credentials=()=>({client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET});
async function token(body){const r=await fetch(tokenUrl,{method:'POST',body:new URLSearchParams({...credentials(),...body})});if(!r.ok)throw Error('Google authorization expired. Reconnect your account.');return r.json()}
async function google(session,path,query){if(Date.now()>session.expiry){const t=await token({grant_type:'refresh_token',refresh_token:session.refresh});session.access=t.access_token;session.expiry=Date.now()+(t.expires_in-60)*1000}let u=new URL('https://www.googleapis.com/calendar/v3/'+path);u.search=new URLSearchParams(query);return fetch(u,{headers:{Authorization:'Bearer '+session.access}})}
export async function calendarAPI(req,res,url){
 const cookie=(n)=>(req.headers.cookie||'').split('; ').find(v=>v.startsWith(n+'='))?.slice(n.length+1);
 const json=(obj,status=200)=>res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify(obj));
 if(req.headers.host!=='127.0.0.1:4310')return json({error:'Unexpected host'},403);
 const {pathname:p}=url;
 try{
 if(p==='/google/connect'){
 if(!credentials().client_id||!credentials().client_secret)return json({error:'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart.'},503);
 const state=randomBytes(32).toString('hex');states.set(state,Date.now()+600000);
 const query=new URLSearchParams({client_id:credentials().client_id,redirect_uri:callback,response_type:'code',access_type:'offline',prompt:'consent',scope:'https://www.googleapis.com/auth/calendar.readonly',state});
 return res.writeHead(302,{Location:'https://accounts.google.com/o/oauth2/v2/auth?'+query,'Set-Cookie':'oauth_state='+state+'; HttpOnly; SameSite=Lax; Max-Age=600'}).end();
 }
 if(p==='/google/callback'){
 const key=cookie('oauth_state');if(!key||url.searchParams.get('state')!==key||!(states.get(key)>Date.now()))return json({error:'Expired authorization'},403);
 states.delete(key);const t=await token({code:url.searchParams.get('code'),redirect_uri:callback,grant_type:'authorization_code'});const sid=randomBytes(32).toString('hex');sessions.set(sid,{access:t.access_token,expiry:Date.now()+(t.expires_in-60)*1000,refresh:t.refresh_token,calendars:new Map()});
 return res.writeHead(302,{Location:'/','Set-Cookie':'lifeos_session='+sid+'; HttpOnly; SameSite=Strict; Path=/'}).end();
 }
 const session=sessions.get(cookie('lifeos_session'));if(!session)return json({connected:false});
 if(p==='/google/calendars'){let list=[],page;do{const r=await google(session,'users/me/calendarList',page?{pageToken:page}:{});if(!r.ok)throw Error('Could not list calendars');const b=await r.json();list.push(...b.items.map(v=>({id:v.id,name:v.summary})));page=b.nextPageToken}while(page);return json({connected:true,list})}
 if(p==='/google/events'){const id=url.searchParams.get('id');if(!id)return json({error:'Missing calendar'},400);let old=session.calendars.get(id),page,rows=new Map(old?.rows);for(;;){const query={singleEvents:'false'};if(old?.token)query.syncToken=old.token;if(page)query.pageToken=page;const r=await google(session,'calendars/'+encodeURIComponent(id)+'/events',query);if(r.status===410&&old){old=undefined;rows.clear();page=undefined;continue}if(!r.ok)throw Error('Calendar sync failed');const b=await r.json();for(const e of b.items){if(e.status==='cancelled')rows.delete(e.id);else rows.set(e.id,{title:e.summary,start:e.start?.dateTime||e.start?.date,end:e.end?.dateTime||e.end?.date})}page=b.nextPageToken;if(!page){session.calendars.set(id,{rows,token:b.nextSyncToken});return json({events:[...rows.values()]})}}}
 return json({error:'Unknown action'},404);
 }catch(err){return json({error:err.message},502)}
}
