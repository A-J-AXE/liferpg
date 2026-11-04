// Planning precision is independent of project membership and deadline.
const civil = (key) => new Date(key + "T12:00:00");
export const dayKey = (d) => [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
export const addDays = (key, amount) => { const d = civil(key); d.setDate(d.getDate()+amount); return dayKey(d); };
export const monthKey = (key) => key.slice(0,7);
export const addMonths = (key, amount) => { const d = civil(monthKey(key)+"-01"); d.setMonth(d.getMonth()+amount); return dayKey(d); };
export const monday = (key) => { const d = civil(key); return addDays(key,-((d.getDay()+6)%7)); };
export function planOf(task) {
  if(task.planning && ["unscheduled","someday","month","week","day","exact-time"].includes(task.planning.kind)) return task.planning;
  if(task.date) return {kind:task.time?"exact-time":"day",value:task.date};
  return {kind:task.someday?"someday":"unscheduled",value:""};
}
export function applyPlan(task,kind,value="",time="") {
  if(!["unscheduled","someday","month","week","day","exact-time"].includes(kind)) throw Error("Invalid planning precision");
  if(["month","week","day","exact-time"].includes(kind) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error("Invalid planning date");
  task.planning={kind,value:kind==="month"?monthKey(value):kind==="week"?monday(value):value};
  if(kind==="day"||kind==="exact-time") task.date=value;
  else task.date="";
  task.time=kind==="exact-time"?time:"";
  task.someday=kind==="someday";
  return task;
}
const esc = (s) => String(s??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const labelDate = (value,options) => civil(value).toLocaleDateString(undefined,options);
export function columns(mode, anchor, today) {
  const thisWeek=monday(today), nextWeek=addDays(thisWeek,7), thisMonth=monthKey(today), nextMonth=monthKey(addMonths(today,1));
  if(mode==="Overview") return [
    {id:"today",title:"Today",subtitle:labelDate(today,{weekday:"short",month:"short",day:"numeric"}),kind:"day",value:today},
    {id:"thisWeek",title:"This Week",subtitle:labelDate(thisWeek,{month:"short",day:"numeric"})+" – "+labelDate(addDays(thisWeek,6),{month:"short",day:"numeric"}),kind:"week",value:thisWeek},
    {id:"nextWeek",title:"Next Week",subtitle:labelDate(nextWeek,{month:"short",day:"numeric"})+" – "+labelDate(addDays(nextWeek,6),{month:"short",day:"numeric"}),kind:"week",value:nextWeek},
    {id:"thisMonth",title:"This Month",subtitle:labelDate(thisMonth+"-01",{month:"long"}),kind:"month",value:thisMonth+"-01"},
    {id:"nextMonth",title:"Next Month",subtitle:labelDate(nextMonth+"-01",{month:"long"}),kind:"month",value:nextMonth+"-01"},
    {id:"someday",title:"Someday",subtitle:"No scheduled date",kind:"someday",value:""}
  ];
  if(mode==="Day") return Array.from({length:7},(_,i)=>{const v=addDays(anchor,i);return {id:v,title:labelDate(v,{weekday:"long"}),subtitle:labelDate(v,{month:"short",day:"numeric"}),kind:"day",value:v};});
  if(mode==="Week") return Array.from({length:5},(_,i)=>{const v=addDays(monday(anchor),7*i);return {id:v,title:"Week of "+labelDate(v,{month:"short",day:"numeric"}),subtitle:labelDate(addDays(v,6),{month:"short",day:"numeric"}),kind:"week",value:v};});
  if(mode==="Month") return Array.from({length:5},(_,i)=>{const v=addMonths(anchor,i);return {id:monthKey(v),title:labelDate(v.slice(0,7)+"-01",{month:"long",year:"numeric"}),subtitle:"Monthly plan",kind:"month",value:v};});
  throw Error("Unknown upcoming mode");
}
export function belongs(task,column,mode,today) {
  const p=planOf(task), d=(p.kind==="day"||p.kind==="exact-time")?p.value:"";
  if(mode==="Day") return d===column.value;
  if(mode==="Week") return p.kind==="week"?p.value===column.value:!!d&&monday(d)===column.value;
  if(mode==="Month") return p.kind==="month"?p.value===monthKey(column.value):p.kind==="week"?monthKey(p.value)===monthKey(column.value):!!d&&monthKey(d)===monthKey(column.value);
  if(mode!=="Overview") return false;
  const w=monday(today), nextW=addDays(w,7), endW=addDays(w,6), endNextW=addDays(nextW,6), m=monthKey(today),nextM=monthKey(addMonths(today,1));
  let id="";
  if(p.kind==="someday") id="someday";
  else if(d) {
    if(d===today) id="today";
    else if(d>today&&d<=endW) id="thisWeek";
    else if(d>=nextW&&d<=endNextW) id="nextWeek";
    else if(monthKey(d)===m) id="thisMonth";
    else if(monthKey(d)===nextM) id="nextMonth";
  } else if(p.kind==="week") {
    if(p.value===w) id="thisWeek";
    else if(p.value===nextW) id="nextWeek";
    else if(monthKey(p.value)===m) id="thisMonth";
    else if(monthKey(p.value)===nextM) id="nextMonth";
  } else if(p.kind==="month") {
    if(p.value===m) id="thisMonth";
    else if(p.value===nextM) id="nextMonth";
  }
  return id===column.id;
}
export function upcomingHTML({tasks,mode,anchor,today,renderTask}) {
  const modes=["Overview","Day","Week","Month"], selected=modes.includes(mode)?mode:"Overview";
  const cols=columns(selected,anchor,today);
  const tabs=modes.map(name=>'<button type="button" class="'+(name===selected?"selected":"")+'" data-act="upMode" data-key="'+name+'" aria-pressed="'+(name===selected)+'">'+name+'</button>').join("");
  const board=cols.map(c=>{
    const list=tasks.filter(t=>!t.trashed&&belongs(t,c,selected,today));
    return '<section class="up-column" data-plan-kind="'+c.kind+'" data-plan-value="'+esc(c.value)+'" aria-label="'+esc(c.title)+'">'+
    '<header class="up-column-head"><div><h2>'+esc(c.title)+'</h2><small>'+esc(c.subtitle)+'</small></div><span class="up-count">'+list.length+'</span></header>'+
    '<form class="up-quick" data-quick-kind="'+c.kind+'" data-quick-value="'+esc(c.value)+'"><label class="sr-only" for="quick-'+esc(c.id)+'">Add task to '+esc(c.title)+'</label><span aria-hidden="true">＋</span><input id="quick-'+esc(c.id)+'" name="title" placeholder="Add task…" autocomplete="off" required maxlength="300"></form>'+
    '<div class="up-task-list">'+list.filter(t=>!t.done).map(renderTask).join("")+
    (list.some(t=>t.done)?'<div class="up-done-label">Completed</div>'+list.filter(t=>t.done).map(renderTask).join(""):"")+
    '</div></section>';
  }).join("");
  return '<section class="upcoming-workspace"><div class="up-toolbar"><div class="up-tabs" role="group" aria-label="Upcoming view">'+tabs+'</div>'+
    ''+(selected === "Overview" ? "" : '<div class="up-navigation"><button type="button" data-act="upPrev" aria-label="Previous periods">‹</button><button type="button" data-act="upToday">Today</button><button type="button" data-act="upNext" aria-label="Next periods">›</button></div>')+'</div>'+
    '<div class="up-scroller"><div class="up-board">'+board+'</div></div></section>';
}
