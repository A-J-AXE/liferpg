// LifeOS planner engine: pure calendar math, local dates and interaction transactions.
// Dates are local civil YYYY-MM-DD; never turn month/week assignments into fake time blocks.
import { addDays } from "./planning.mjs";

export const STEP_MINUTES = 15;
export const DAY_MINUTES = 1440;
export const PLANNER_HOURS = Object.freeze(Array.from({ length: 24 }, (_, i) => i));

export function minutesOf(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value ?? ""));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}
export function clockOf(minutes) {
  const bounded = Math.min(DAY_MINUTES - STEP_MINUTES, Math.max(0, Math.round(Number(minutes) / STEP_MINUTES) * STEP_MINUTES));
  return String(Math.floor(bounded / 60)).padStart(2, "0") + ":" + String(bounded % 60).padStart(2, "0");
}
export function clampDuration(start, minutes) {
  const begin = minutesOf(start);
  if (begin === null) throw Error("A valid HH:MM start time is required");
  const n = Number(minutes);
  const rounded = Number.isFinite(n) ? Math.round(n / STEP_MINUTES) * STEP_MINUTES : 30;
  return Math.max(STEP_MINUTES, Math.min(DAY_MINUTES - begin, rounded));
}
export function slotTime(hour, fraction) {
  const h = Number(hour), f = Math.max(0, Math.min(0.99999, Number(fraction)));
  if (!Number.isInteger(h) || h < 0 || h > 23) throw Error("Invalid hour slot");
  return clockOf(h * 60 + Math.floor(f * 4) * STEP_MINUTES);
}
export function timeFromPointer(hour, clientY, rect) {
  if (!rect || !(rect.height > 0)) return slotTime(hour, 0);
  return slotTime(hour, (clientY - rect.top) / rect.height);
}
export function scheduleAt(task, date, time) {
  const begin = minutesOf(time);
  if (begin === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error("Invalid time block");
  const updated = clockOf(begin);
  task.date = date;
  task.time = updated;
  task.minutes = String(clampDuration(updated, task.minutes || 30));
  task.planning = { kind: "exact-time", value: date };
  task.someday = false;
  return task;
}
export function moveTaskBy(task, dayDelta, minuteDelta) {
  const original = minutesOf(task.time);
  if (original === null || !task.date) throw Error("Task must have an exact time");
  let at = original + minuteDelta;
  let days = Number(dayDelta);
  while (at < 0) { at += DAY_MINUTES; days -= 1; }
  while (at >= DAY_MINUTES) { at -= DAY_MINUTES; days += 1; }
  return scheduleAt(task, addDays(task.date, days), clockOf(at));
}
export function resizeTaskBy(task, delta) {
  if (minutesOf(task.time) === null) throw Error("Task needs an exact time");
  task.minutes = String(clampDuration(task.time, Number(task.minutes || 30) + delta));
  return task;
}
export function snapshot(task) {
  return {
    date: task.date || "", time: task.time || "", minutes: String(task.minutes || 30),
    planning: task.planning ? { ...task.planning } : undefined,
    someday: !!task.someday,
  };
}
export function restore(task, value) {
  task.date = value.date;
  task.time = value.time;
  task.minutes = value.minutes;
  if (value.planning) task.planning = { ...value.planning };
  else delete task.planning;
  task.someday = value.someday;
  return task;
}
// Stable lane packing for all overlapping events, including staggered chains.
// Width is determined by the maximum concurrent lane count in each connected group.
export function layoutEvents(tasks) {
  const valid = tasks.filter((task) => minutesOf(task.time) !== null && Number(task.minutes || 0) > 0)
    .sort((a, b) => minutesOf(a.time) - minutesOf(b.time) || String(a.id).localeCompare(String(b.id)));
  const results = [];
  let group = [], ends = [];
  const flush = () => {
    const columns = ends.length;
    for (const item of group) {
      results.push({
        id: item.task.id,
        task: item.task,
        start: item.start,
        duration: item.duration,
        lane: item.lane,
        columns,
        top: item.start / 60,
        height: item.duration / 60,
        left: (item.lane / columns) * 100,
        width: 100 / columns,
      });
    }
    group = [];
    ends = [];
  };
  for (const task of valid) {
    const start = minutesOf(task.time);
    const duration = clampDuration(task.time, task.minutes);
    if (ends.length && ends.every((end) => end <= start)) flush();
    let lane = ends.findIndex((end) => end <= start);
    if (lane < 0) lane = ends.length;
    ends[lane] = start + duration;
    group.push({ task, start, duration, lane });
  }
  if (group.length) flush();
  return results;
}
