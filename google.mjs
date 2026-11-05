import { randomBytes, createHash } from "node:crypto";
const base = process.env.PUBLIC_ORIGIN || "http://127.0.0.1:4310";
const callback = base + "/google/callback";
const states = new Map(),
  sessions = new Map();
const tokenUrl = "https://oauth2.googleapis.com/token";
const credentials = () => ({
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
});
async function token(body) {
  const r = await fetch(tokenUrl, {
    method: "POST",
    body: new URLSearchParams({ ...credentials(), ...body }),
  });
  if (!r.ok)
    throw Error("Google authorization expired. Reconnect your account.");
  return r.json();
}
async function google(session, path, query, method = "GET", body) {
  if (Date.now() > session.expiry) {
    const t = await token({
      grant_type: "refresh_token",
      refresh_token: session.refresh,
    });
    session.access = t.access_token;
    session.expiry = Date.now() + (t.expires_in - 60) * 1000;
  }
  let u = new URL("https://www.googleapis.com/calendar/v3/" + path);
  u.search = new URLSearchParams(query);
  return fetch(u, {
    method,
    headers: {
      Authorization: "Bearer " + session.access,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
export async function calendarAPI(req, res, url) {
  const cookie = (n) =>
    (req.headers.cookie || "")
      .split("; ")
      .find((v) => v.startsWith(n + "="))
      ?.slice(n.length + 1);
  const json = (obj, status = 200) =>
    res
      .writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      })
      .end(JSON.stringify(obj));
  if (
    req.headers.host !==
    new URL(process.env.PUBLIC_ORIGIN || "http://127.0.0.1:4310").host
  )
    return json({ error: "Unexpected host" }, 403);
  const { pathname: p } = url;
  try {
    if (p === "/google/connect") {
      if (!credentials().client_id || !credentials().client_secret)
        return json(
          {
            error:
              "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart.",
          },
          503,
        );
      const state = randomBytes(32).toString("hex");
      states.set(state, Date.now() + 600000);
      const query = new URLSearchParams({
        client_id: credentials().client_id,
        redirect_uri: callback,
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
        scope: url.searchParams.has("write")
          ? "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events"
          : "https://www.googleapis.com/auth/calendar.readonly",
        state,
      });
      return res
        .writeHead(302, {
          Location: "https://accounts.google.com/o/oauth2/v2/auth?" + query,
          "Set-Cookie":
            "oauth_state=" + state + "; HttpOnly; SameSite=Lax; Max-Age=600",
        })
        .end();
    }
    if (p === "/google/callback") {
      const key = cookie("oauth_state");
      if (
        !key ||
        url.searchParams.get("state") !== key ||
        !(states.get(key) > Date.now())
      )
        return json({ error: "Expired authorization" }, 403);
      states.delete(key);
      const t = await token({
        code: url.searchParams.get("code"),
        redirect_uri: callback,
        grant_type: "authorization_code",
      });
      const sid = randomBytes(32).toString("hex");
      sessions.set(sid, {
        access: t.access_token,
        expiry: Date.now() + (t.expires_in - 60) * 1000,
        refresh: t.refresh_token,
        calendars: new Map(),
      });
      return res
        .writeHead(302, {
          Location: "/",
          "Set-Cookie":
            "lifeos_session=" + sid + "; HttpOnly; SameSite=Strict; Path=/",
        })
        .end();
    }
    const session = sessions.get(cookie("lifeos_session"));
    if (!session) return json({ connected: false });
    if (p === "/google/lock") {
      if (req.method !== "POST" || req.headers.origin !== base)
        return json({ error: "Invalid request" }, 403);
      let raw = "";
      for await (const c of req) {
        raw += c;
        if (raw.length > 16384)
          return json({ error: "Request too large" }, 413);
      }
      const t = JSON.parse(raw);
      if (!t.id || !t.calendar)
        return json({ error: "Missing task or calendar" }, 400);
      const key = createHash("sha256")
          .update("lifeos:" + t.id)
          .digest("hex"),
        root = "calendars/" + encodeURIComponent(t.calendar) + "/events";
      const read = await google(session, root + "/" + key, {});
      if (!read.ok && ![404, 410].includes(read.status))
        return json({ error: "Authorize Google calendar event access" }, 403);
      const existing = read.ok ? await read.json() : null;
      if (existing && existing.extendedProperties?.private?.lifeosId !== t.id)
        return json({ error: "Calendar event belongs to another source" }, 409);
      if (t.remove) {
        if (existing) {
          const r = await google(session, root + "/" + key, {}, "DELETE");
          if (!r.ok) return json({ error: "Could not unlock block" }, r.status);
        }
        return json({ ok: true });
      }
      const event = {
        summary: t.title,
        start: { dateTime: new Date(t.start).toISOString() },
        end: { dateTime: new Date(t.end).toISOString() },
        visibility: t.private ? "private" : "default",
        extendedProperties: { private: { lifeosId: t.id } },
      };
      const r = existing
        ? await google(session, root + "/" + key, {}, "PATCH", event)
        : await google(session, root, {}, "POST", { ...event, id: key });
      return json(
        r.ok ? { ok: true } : { error: "Google could not save this block" },
        r.ok ? 200 : 502,
      );
    }
    if (p === "/google/calendars") {
      let list = [],
        page;
      do {
        const r = await google(
          session,
          "users/me/calendarList",
          page ? { pageToken: page } : {},
        );
        if (!r.ok) throw Error("Could not list calendars");
        const b = await r.json();
        list.push(
          ...b.items.map((v) => ({
            id: v.id,
            name: v.summary,
            color: v.backgroundColor,
            access: v.accessRole,
          })),
        );
        page = b.nextPageToken;
      } while (page);
      return json({ connected: true, list });
    }
    if (p === "/google/events") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Missing calendar" }, 400);
      const from = url.searchParams.get("from"),
        to = url.searchParams.get("to");
      if (from || to) {
        const duration = Date.parse(to) - Date.parse(from);
        if (
          !Number.isFinite(duration) ||
          duration <= 0 ||
          duration > 9 * 86400000
        )
          return json({ error: "Invalid calendar range" }, 400);
        const events = new Map();
        let pageToken;
        do {
          const query = {
            singleEvents: "true",
            timeMin: from,
            timeMax: to,
            ...(pageToken ? { pageToken } : {}),
          };
          const response = await google(
            session,
            "calendars/" + encodeURIComponent(id) + "/events",
            query,
          );
          if (!response.ok)
            return json({ error: "Calendar unavailable" }, response.status);
          const data = await response.json();
          for (const e of data.items || [])
            if (e.status !== "cancelled")
              events.set(e.id, {
                id: e.id,
                title: e.summary || "Busy",
                lifeosId: e.extendedProperties?.private?.lifeosId,
                start: e.start?.dateTime || e.start?.date,
                end: e.end?.dateTime || e.end?.date,
              });
          pageToken = data.nextPageToken;
        } while (pageToken);
        return json({ events: [...events.values()] });
      }
      let old = session.calendars.get(id),
        page,
        rows = new Map(old?.rows);
      for (;;) {
        const query = { singleEvents: "false" };
        if (old?.token) query.syncToken = old.token;
        if (page) query.pageToken = page;
        const r = await google(
          session,
          "calendars/" + encodeURIComponent(id) + "/events",
          query,
        );
        if (r.status === 410 && old) {
          old = undefined;
          rows.clear();
          page = undefined;
          continue;
        }
        if (!r.ok) throw Error("Calendar sync failed");
        const b = await r.json();
        for (const e of b.items) {
          if (e.status === "cancelled") rows.delete(e.id);
          else
            rows.set(e.id, {
              id: e.id,
              lifeosId: e.extendedProperties?.private?.lifeosId,
              title: e.summary,
              start: e.start?.dateTime || e.start?.date,
              end: e.end?.dateTime || e.end?.date,
            });
        }
        page = b.nextPageToken;
        if (!page) {
          session.calendars.set(id, { rows, token: b.nextSyncToken });
          return json({ events: [...rows.values()] });
        }
      }
    }
    return json({ error: "Unknown action" }, 404);
  } catch (err) {
    return json({ error: err.message }, 502);
  }
}
