import assert from "node:assert/strict";
import {
  STEP_MINUTES, DAY_MINUTES, PLANNER_HOURS, minutesOf, clockOf, clampDuration,
  slotTime, timeFromPointer, scheduleAt, moveTaskBy, resizeTaskBy, snapshot,
  restore, layoutEvents,
} from "./ui/planner-engine.mjs";

assert.equal(STEP_MINUTES, 15);
assert.equal(DAY_MINUTES, 1440);
assert.equal(PLANNER_HOURS.length, 24);
assert.deepEqual([PLANNER_HOURS[0], PLANNER_HOURS[23]],[0,23]);
assert.equal(minutesOf("10:45"),645);
assert.equal(minutesOf("23:59"),1439);
assert.equal(minutesOf("24:00"),null);
assert.equal(minutesOf("9:30"),null);
assert.equal(clockOf(643),"10:45");
assert.equal(clockOf(-40),"00:00");
assert.equal(clockOf(1450),"23:45");
assert.equal(slotTime(10,0),"10:00");
assert.equal(slotTime(10,.249),"10:00");
assert.equal(slotTime(10,.5),"10:30");
assert.equal(slotTime(10,.98),"10:45");
assert.equal(timeFromPointer("10",142,{top:100,height:56}),"10:45");
assert.equal(timeFromPointer("10",100,{top:100,height:56}),"10:00");
assert.equal(clampDuration("23:45",180),15);
assert.equal(clampDuration("10:00",0),15);
assert.equal(clampDuration("10:00",80),75);

const task={id:"a",title:"Task",project:"alpha",date:"",time:"",minutes:"30",done:false,receipts:{xyz:2}};
scheduleAt(task,"2026-11-04","10:45");
assert.equal(task.date,"2026-11-04");
assert.equal(task.time,"10:45");
assert.equal(task.planning.kind,"exact-time");
assert.equal(task.planning.value,"2026-11-04");
assert.equal(task.project,"alpha");
const original=snapshot(task);
moveTaskBy(task,1,-15);
assert.deepEqual([task.date,task.time],["2026-11-05","10:30"]);
moveTaskBy(task,0,-630);
assert.deepEqual([task.date,task.time],["2026-11-05","00:00"]);
moveTaskBy(task,0,-15);
assert.deepEqual([task.date,task.time],["2026-11-04","23:45"]);
resizeTaskBy(task,1000);
assert.equal(Number(task.minutes),15);
restore(task,original);
assert.deepEqual([task.date,task.time,task.minutes,task.project],["2026-11-04","10:45","30","alpha"]);
assert.equal(task.receipts.xyz,2);

const sample=[
  {id:"a",time:"10:00",minutes:60},
  {id:"b",time:"10:15",minutes:30},
  {id:"c",time:"10:30",minutes:45},
  {id:"d",time:"11:15",minutes:30},
  {id:"e",time:"16:00",minutes:30},
];
const positions=layoutEvents(sample);
assert.equal(positions.length,sample.length);
assert.deepEqual(positions.slice(0,3).map(x=>x.columns),[3,3,3]);
assert(positions.slice(0,3).every(x=>Math.round(x.width*10)/10===33.3));
assert.equal(positions.at(-1).columns,1);
const ids=positions.map(x=>x.id);
assert.equal(new Set(ids).size,5);
console.log("PASS 24-hour Planner, quarter-hour snapping, pointer targeting, overlap lanes, cross-day movement, duration caps and reversible state");
