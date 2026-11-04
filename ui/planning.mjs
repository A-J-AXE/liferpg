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

export const UPCOMING_SORTS=Object.freeze(["manual","priority","title","duration"]);
export function columnRankKey(column,mode) {
  return mode==="Overview"?"overview:"+column.id:column.kind+":"+column.value;
}
export function sortedColumnTasks(tasks,column,mode,today,sort="manual") {
  const rankKey=columnRankKey(column,mode);
  const pRank={Goal:0,High:1,Medium:2,Low:3,None:4};
  return tasks.filter(t=>!t.trashed&&belongs(t,column,mode,today)).sort((a,b)=>{
    if(Boolean(a.done)!==Boolean(b.done))return a.done?1:-1;
    if(sort==="priority") {
      const diff=(pRank[a.priority]??4)-(pRank[b.priority]??4);
      if(diff)return diff;
    }
    if(sort==="title"){const diff=String(a.title).localeCompare(String(b.title));if(diff)return diff;}
    if(sort==="duration"){const diff=Number(a.minutes||0)-Number(b.minutes||0);if(diff)return diff;}
    const ra=Number(a.upcomingRanks?.[rankKey]),rb=Number(b.upcomingRanks?.[rankKey]);
    const ia=Number.isFinite(ra)?ra:1e9, ib=Number.isFinite(rb)?rb:1e9;
    return ia-ib||String(a.id).localeCompare(String(b.id));
  });
}
export function moveUpcomingTask(tasks,task,column,mode,today,beforeId=null) {
  if(!task||!column||!tasks.includes(task))throw Error("Unknown task or column");
  const isAlreadyHere=belongs(task,column,mode,today);
  // A pure reorder must never downgrade a precisely scheduled task to week/month precision.
  if(!isAlreadyHere)applyPlan(task,column.kind,column.value);
  const key=columnRankKey(column,mode);
  const peers=sortedColumnTasks(tasks,column,mode,today).filter(t=>!t.done&&t.id!==task.id);
  const destination=beforeId?peers.findIndex(t=>t.id===beforeId):-1;
  peers.splice(destination<0?peers.length:destination,0,task);
  for(let i=0;i<peers.length;i++){
    const candidate=peers[i];
    candidate.upcomingRanks={...(candidate.upcomingRanks||{}),[key]:i};
  }
  return task;
}
export function nudgeUpcomingTask(tasks,task,columnsList,mode,today,direction,axis="row") {
  const current=columnsList.findIndex(column=>belongs(task,column,mode,today));
  if(current<0)return false;
  const column=columnsList[current];
  if(axis==="column"){
    const next=columnsList[current+direction];if(!next)return false;
    moveUpcomingTask(tasks,task,next,mode,today);
    return true;
  }
  const peers=sortedColumnTasks(tasks,column,mode,today).filter(t=>!t.done);
  const idx=peers.indexOf(task),other=peers[idx+direction];
  if(idx<0||!other)return false;
  const without=peers.filter(t=>t!==task);
  const index=direction<0?without.indexOf(other):without.indexOf(other)+1;
  without.splice(index,0,task);
  const key=columnRankKey(column,mode);
  without.forEach((t,i)=>t.upcomingRanks={...(t.upcomingRanks||{}),[key]:i});
  return true;
}

export function upcomingHTML({tasks,mode,anchor,today,renderTask,sort="manual"}) {
  const modes=["Overview","Day","Week","Month"], selected=modes.includes(mode)?mode:"Overview";
  const chosenSort=UPCOMING_SORTS.includes(sort)?sort:"manual";
  const cols=columns(selected,anchor,today);
  const tabs=modes.map(name=>'<button type="button" class="'+(name===selected?"selected":"")+'" data-act="upMode" data-key="'+name+'" aria-pressed="'+(name===selected)+'">'+name+'</button>').join("");
  const row=(t,c)=>'<div class="up-draggable" tabindex="0" role="group" draggable="true" data-up-task="'+esc(t.id)+'" data-up-column="'+esc(c.id)+'" aria-label="'+esc("Plan "+t.title)+
    ' · Alt plus arrow keys move a task">'+renderTask(t)+'</div>';
  const board=cols.map(c=>{
    const list=sortedColumnTasks(tasks,c,selected,today,chosenSort);
    const open=list.filter(t=>!t.done),done=list.filter(t=>t.done);
    return '<section class="up-column" data-plan-kind="'+c.kind+'" data-plan-value="'+esc(c.value)+'" data-column-id="'+esc(c.id)+'" aria-label="'+esc(c.title)+'">'+
    '<header class="up-column-head"><div><h2>'+esc(c.title)+'</h2><small>'+esc(c.subtitle)+'</small></div><span class="up-count">'+open.length+'</span></header>'+
    '<form class="up-quick" data-quick-kind="'+c.kind+'" data-quick-value="'+esc(c.value)+'"><label class="sr-only" for="quick-'+esc(c.id)+'">Add task to '+esc(c.title)+'</label><span aria-hidden="true">＋</span><input id="quick-'+esc(c.id)+'" name="title" placeholder="Add task…" autocomplete="off" required maxlength="300"></form>'+
    '<div class="up-task-list">'+open.map(t=>row(t,c)).join("")+
    (done.length?'<details class="up-completed"><summary>Completed · '+done.length+'</summary>'+done.map(t=>row(t,c)).join("")+'</details>':"")+
    '</div></section>';
  }).join("");
  const sortLabels={manual:"Manual order",priority:"Priority",title:"Task name",duration:"Duration"};
  return '<section class="upcoming-workspace" data-upcoming-mode="'+selected+'"><div class="up-toolbar"><div class="up-tabs" role="group" aria-label="Upcoming view">'+tabs+'</div>'+
    '<div class="up-controls">'+
    '<label class="up-sort-label" for="up-sort">Sort</label><select id="up-sort" aria-label="Sort upcoming tasks">'+
    UPCOMING_SORTS.map(s=>'<option value="'+s+'" '+(chosenSort===s?"selected":"")+'>'+sortLabels[s]+'</option>').join("")+'</select>'+
    (selected==="Overview"?"":'<div class="up-navigation"><button type="button" data-act="upPrev" aria-label="Previous periods">‹</button><button type="button" data-act="upToday">Today</button><button type="button" data-act="upNext" aria-label="Next periods">›</button></div>')+'</div></div>'+
    '<p class="up-hint">Drag to plan · Alt + ↑/↓ reorder · Alt + ←/→ move between periods</p>'+
    '<div class="up-scroller"><div class="up-board">'+board+'</div></div></section>';
}
