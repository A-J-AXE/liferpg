import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, renameSync } from "node:fs";
const dir = new URL("./.private/", import.meta.url);
const file = new URL("availability.json", dir);
function load() {
  try {
    return JSON.parse(readFileSync(file));
  } catch (e) {
    if (e.code === "ENOENT") return { id: randomUUID(), bookings: [] };
    throw e;
  }
}
function store(data) {
  mkdirSync(dir, { recursive: true });
  const tmp = new URL("availability.tmp", dir);
  writeFileSync(tmp, JSON.stringify(data));
  renameSync(tmp, file);
}
function esc(t) {
  return String(t ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function slots(state) {
  const c = state.config;
  if (!c) return [];
  const rows = [];
  const busy = [...state.bookings, ...(c.busy || [])];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    if (!c.days.includes(String(date.getDay()))) continue;
    date.setHours(+c.hour, 0, 0, 0);
    for (let h = 0; h < c.hours; h++) {
      const start = date.getTime() + h * 3600000,
        end = start + c.duration * 60000;
      if (
        start < Date.now() + c.notice * 3600000 ||
        busy.some(
          (b) =>
            start - c.buffer * 60000 < b.end &&
            end + c.buffer * 60000 > b.start,
        )
      )
        continue;
      rows.push(start);
    }
  }
  return rows;
}
async function body(req) {
  let v = "";
  for await (const chunk of req) {
    v += chunk;
    if (v.length > 1e6) throw Error("Request too large");
  }
  return v;
}
export async function availability(req, res, u) {
  try {
    const json = (v, n = 200) =>
      res
        .writeHead(n, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        })
        .end(JSON.stringify(v));
    if (u.pathname === "/availability") {
      if (
        req.headers.host !==
        new URL(process.env.PUBLIC_ORIGIN || "http://127.0.0.1:4310").host
      )
        return json({}, 403);
      if (req.method === "POST") {
        if (
          req.headers.origin !==
          (process.env.PUBLIC_ORIGIN || "http://127.0.0.1:4310")
        )
          return json({}, 403);
        const c = JSON.parse(await body(req));
        if (
          !Number.isFinite(c.duration) ||
          c.duration < 5 ||
          c.duration > 480 ||
          c.hours < 1 ||
          c.hours > 24 ||
          !Array.isArray(c.busy) ||
          !Array.isArray(c.days)
        )
          return json({ error: "Invalid availability" }, 400);
        const state = load();
        state.config = c;
        store(state);
        return json({ path: "/book/" + state.id });
      }
      const state = load();
      return json({
        config: state.config,
        path: state.config ? "/book/" + state.id : null,
        bookings: state.bookings,
      });
    }
    const incoming =
      req.method === "POST" ? new URLSearchParams(await body(req)) : null;
    const state = load();
    if (!state.config || u.pathname !== "/book/" + state.id) {
      res.writeHead(404).end();
      return;
    }
    if (incoming) {
      const start = Number(incoming.get("slot")),
        name = incoming.get("name")?.trim();
      if (!name || !slots(state).includes(start)) {
        res
          .writeHead(409)
          .end("That time is unavailable. Reload to choose another.");
        return;
      }
      state.bookings.push({
        start,
        end: start + state.config.duration * 60000,
        name: name.slice(0, 120),
        answer: (incoming.get("answer") || "").slice(0, 500),
      });
      store(state);
      res
        .writeHead(200, { "Content-Type": "text/plain" })
        .end("Booking confirmed.");
      return;
    }
    res
      .writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; form-action 'self'",
      })
      .end(
        "<title>Book a time</title><h1>" +
          esc(state.config.title) +
          "</h1><p>" +
          state.config.duration +
          " minutes · " +
          esc(state.config.location) +
          '</p><form method="post"><label>Time <select required name="slot">' +
          slots(state)
            .map(
              (t) =>
                '<option value="' +
                t +
                '">' +
                esc(new Date(t).toLocaleString()) +
                "</option>",
            )
            .join("") +
          '</select></label><p><label>Your name <input required name="name"></label></p><label>' +
          esc(state.config.question) +
          ' <input name="answer"></label><p><button>Book time</button></p></form>',
      );
  } catch {
    res.writeHead(400).end("Could not process booking.");
  }
}
