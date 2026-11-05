// Period keys are local civil dates. They never represent an instant.
export function key(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export const civil = (value) => new Date(value + "T12:00:00");
export function offset(value, days) {
  const d = civil(value);
  d.setDate(d.getDate() + days);
  return key(d);
}
export function month(value, n = 0) {
  const d = civil(value);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return key(d).slice(0, 7);
}
export function localeWeek() {
  try {
    const l = new Intl.Locale(navigator.language);
    return (l.getWeekInfo?.() || l.weekInfo).firstDay % 7;
  } catch {
    return 1;
  }
}
export function week(value, start = 1) {
  return offset(value, -((civil(value).getDay() - start + 7) % 7));
}
export function plan(t) {
  if (t.date) return { kind: t.time ? "exact-time" : "day", value: t.date };
  return ["month", "week", "someday"].includes(t.period?.kind)
    ? t.period
    : { kind: "unscheduled", value: "" };
}
export function applyPlan(t, p, time = "") {
  const exact = ["exact-time", "day"].includes(p.kind);
  t.date = exact ? p.value : "";
  t.time = p.kind === "exact-time" ? time : "";
  if (["week", "month", "someday"].includes(p.kind))
    t.period = { kind: p.kind, value: p.value || "" };
  else delete t.period;
}
export function columns(mode, anchor, start = 1) {
  const fmt = (v, opts) => civil(v).toLocaleDateString(undefined, opts);
  const make = (kind, value, title, detail) => ({ kind, value, title, detail });
  const w = week(anchor, start),
    m = month(anchor);
  const dow = (v) =>
    fmt(v, { weekday: "short", month: "short", day: "numeric" });
  const wr = (v) => dow(v) + " – " + dow(offset(v, 6));
  const mn = (v) => fmt(v + "-01", { month: "long", year: "numeric" });
  if (mode === "Overview")
    return [
      make("day", anchor, "Today", dow(anchor)),
      make("week", w, "This Week", wr(w)),
      make("week", offset(w, 7), "Next Week", wr(offset(w, 7))),
      make("month", m, "This Month", mn(m)),
      make("month", month(anchor, 1), "Next Month", mn(month(anchor, 1))),
      make("someday", "", "Someday", "No fixed date"),
    ];
  return Array.from({ length: mode === "Day" ? 7 : 6 }, (_, i) => {
    if (mode === "Day") {
      const v = offset(anchor, i);
      return make("day", v, fmt(v, { weekday: "long" }), dow(v));
    }
    if (mode === "Week") {
      const v = offset(w, i * 7),
        th = offset(v, (4 - civil(v).getDay() + 7) % 7),
        jan4 = key(new Date(civil(th).getFullYear(), 0, 4));
      const no =
        1 +
        Math.floor((Date.parse(th) - Date.parse(week(jan4, 1))) / 86400000 / 7);
      return make("week", v, "Week " + no, wr(v));
    }
    const v = month(anchor, i);
    return make("month", v, mn(v), "Month plan");
  });
}
export function bucket(t, cols) {
  const p = plan(t);
  return cols.findIndex((c) => {
    if (c.kind === "someday") return p.kind === "someday";
    if (!p.value || p.kind === "someday") return false;
    if (c.kind === "day")
      return ["day", "exact-time"].includes(p.kind) && p.value === c.value;
    if (c.kind === "week")
      return (
        p.kind !== "month" &&
        p.value >= c.value &&
        p.value <= offset(c.value, 6)
      );
    return p.value.slice(0, 7) === c.value;
  });
}
export function lanes(items) {
  const out = [];
  let group = [],
    ends = [];
  const flush = () => {
    for (const it of group) out.push({ ...it, width: ends.length });
    group = [];
    ends = [];
  };
  for (const it of [...items].sort(
    (a, b) => a.at - b.at || b.until - a.until,
  )) {
    if (ends.length && Math.max(...ends) <= it.at) flush();
    let lane = ends.findIndex((v) => v <= it.at);
    if (lane < 0) lane = ends.length;
    ends[lane] = it.until;
    group.push({ ...it, lane });
  }
  flush();
  return out;
}
export const clock = (n) =>
  [Math.floor(n / 60), n % 60].map((x) => String(x).padStart(2, "0")).join(":");
export const minute = (time) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
