import assert from "node:assert/strict";
import {
  columns, addDays, monday, planOf, applyPlan, belongs,
  sortedColumnTasks, moveUpcomingTask, nudgeUpcomingTask, columnRankKey, upcomingHTML,
} from "./ui/planning.mjs";

const now="2026-11-04";
const board=columns("Overview",now,now);
const today=board[0],thisWeek=board[1],nextWeek=board[2],nextMonth=board[4],someday=board[5];
const tasks=[
  {id:"a",title:"Alpha",project:"research",date:"",time:"",priority:"Low",minutes:"30",done:false},
  {id:"b",title:"Beta",project:"robotics",date:"",time:"",priority:"High",minutes:"60",done:false},
  {id:"c",title:"Charlie",project:"fitness",date:"",time:"",priority:"Medium",minutes:"15",done:false},
];
for(const t of tasks)applyPlan(t,"day",now);
assert.deepEqual(sortedColumnTasks(tasks,today,"Overview",now,"priority").map(t=>t.id),["b","c","a"]);
assert.deepEqual(sortedColumnTasks(tasks,today,"Overview",now,"duration").map(t=>t.id),["c","a","b"]);
assert.deepEqual(sortedColumnTasks(tasks,today,"Overview",now,"title").map(t=>t.id),["a","b","c"]);
moveUpcomingTask(tasks,tasks[2],today,"Overview",now,"a");
assert.deepEqual(sortedColumnTasks(tasks,today,"Overview",now).map(t=>t.id),["c","a","b"]);
assert.equal(tasks[2].planning.kind,"day");
assert.equal(tasks[2].date,now);
assert.equal(tasks[2].project,"fitness");
assert.equal(columnRankKey(today,"Overview"),"overview:today");

assert(nudgeUpcomingTask(tasks,tasks[2],board,"Overview",now,1,"row"));
assert.deepEqual(sortedColumnTasks(tasks,today,"Overview",now).map(t=>t.id),["a","c","b"]);
assert(nudgeUpcomingTask(tasks,tasks[2],board,"Overview",now,1,"column"));
assert.equal(planOf(tasks[2]).kind,"week");
assert.equal(tasks[2].date,"");
assert.equal(tasks[2].project,"fitness");
assert.deepEqual(board.filter(c=>belongs(tasks[2],c,"Overview",now)).map(c=>c.id),["thisWeek"]);
assert(nudgeUpcomingTask(tasks,tasks[2],board,"Overview",now,1,"column"));
assert.equal(planOf(tasks[2]).value,addDays(monday(now),7));
assert.deepEqual(board.filter(c=>belongs(tasks[2],c,"Overview",now)).map(c=>c.id),["nextWeek"]);
moveUpcomingTask(tasks,tasks[2],nextMonth,"Overview",now);
assert.deepEqual(planOf(tasks[2]),{kind:"month",value:"2026-12"});
assert.equal(tasks[2].date,"");
assert.equal(tasks[2].time,"");
assert.equal(tasks[2].project,"fitness");
moveUpcomingTask(tasks,tasks[2],someday,"Overview",now);
assert.equal(planOf(tasks[2]).kind,"someday");

const exact={id:"e",title:"Exact appointment",project:"alpha",date:"",time:"",minutes:"30",priority:"None",done:false};
applyPlan(exact,"exact-time",now,"11:15");tasks.push(exact);
moveUpcomingTask(tasks,exact,today,"Overview",now);
assert.equal(exact.time,"11:15","Reorder within the same period must not drop time precision");
assert.equal(exact.planning.kind,"exact-time");
moveUpcomingTask(tasks,exact,thisWeek,"Overview",now);
assert.equal(exact.time,"","Moving to a different period clears exact-time assignment");
assert.equal(exact.planning.kind,"week");

const d=columns("Day",now,now),w=columns("Week",now,now),m=columns("Month",now,now);
assert.deepEqual([d.length,w.length,m.length],[7,5,5]);
moveUpcomingTask(tasks,tasks[0],w[1],"Week",now);
assert.equal(tasks[0].planning.kind,"week");
assert.equal(tasks[0].planning.value,w[1].value);
moveUpcomingTask(tasks,tasks[1],m[1],"Month",now);
assert.equal(tasks[1].planning.kind,"month");
assert.equal(tasks[1].planning.value,m[1].value.slice(0,7));

const sameIdentity=tasks.map(t=>t.id);
assert.equal(new Set(sameIdentity).size,tasks.length);
const html=upcomingHTML({tasks,mode:"Overview",anchor:now,today:now,renderTask:t=>'<div data-task="'+t.id+'">'+t.title+"</div>",sort:"manual"});
assert.equal((html.match(/data-up-task="c"/g)||[]).length,1);
assert.match(html,/data-upcoming-mode="Overview"/);
assert.match(html,/Alt \+ ↑\/↓ reorder/);
assert.match(html,/Sort upcoming tasks/);
assert.match(html,/up-completed|up-column/);

const repeatBase={id:"f",date:"2026-11-04",time:"10:00",project:"r",repeat:"Weekly",done:true,planning:{kind:"exact-time",value:"2026-11-04"}};
const repeatFuture={...repeatBase,id:"g",previous:"f",series:"f",date:"2026-11-11",planning:{kind:"exact-time",value:"2026-11-11"},done:false};
const updatedTime={...repeatFuture,time:"12:45"};
applyPlan(repeatFuture,updatedTime.time?"exact-time":"day",repeatFuture.date,updatedTime.time);
assert.equal(repeatFuture.date,"2026-11-11");
assert.equal(repeatFuture.planning.value,"2026-11-11");
assert.equal(repeatFuture.time,"12:45");
console.log("PASS Upcoming: sorting, stable order, keyboard nudges, cross-period planning, exact-time preservation, board modes, no cloned tasks and recurrence precision");
