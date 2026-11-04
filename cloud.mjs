import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { timingSafeEqual, createHash } from "node:crypto";
const folder = new URL(
  process.env.LIFEOS_WORKSPACE_DIR || "./.private/",
  import.meta.url,
);
const file = new URL("workspace.json", folder);
export function authorized(req) {
  const wanted = process.env.PLANNER_PASSWORD;
  if (!wanted) return false;
  const compare = (v) => createHash("sha256").update(v).digest();
  return timingSafeEqual(
    compare(req.headers.authorization || ""),
    compare("Basic " + Buffer.from("owner:" + wanted).toString("base64")),
  );
}
export async function workspace(req, res) {
  const reply = (n, v) =>
    res
      .writeHead(n, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      })
      .end(JSON.stringify(v));
  try {
    if (req.method === "GET")
      return reply(
        200,
        existsSync(file)
          ? JSON.parse(readFileSync(file))
          : { revision: 0, data: null },
      );
    if (
      req.method !== "PUT" ||
      req.headers.origin !== process.env.PUBLIC_ORIGIN
    )
      return reply(403, {});
    req.setEncoding("utf8");
    let body = "";
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 12000000) return reply(413, {});
    }
    const incoming = JSON.parse(body),
      current = existsSync(file)
        ? JSON.parse(readFileSync(file))
        : { revision: 0 };
    if (incoming.revision !== current.revision)
      return reply(409, { revision: current.revision });
    if (
      !Array.isArray(incoming.data?.tasks) ||
      !Array.isArray(incoming.data.projects)
    )
      return reply(400, {});
    mkdirSync(folder, { recursive: true });
    const next = { revision: current.revision + 1, data: incoming.data };
    const tmp = new URL("workspace.tmp", folder);
    writeFileSync(tmp, JSON.stringify(next), { mode: 0o600 });
    renameSync(tmp, file);
    const share = new URL("planner.json", folder);
    if (next.data.mcp) {
      const projects = new Map(next.data.projects.map((p) => [p.id, p.name]));
      const tasks = next.data.tasks.map((t) => ({
        title: t.title,
        date: t.date,
        time: t.time,
        done: t.done,
        project: projects.get(t.project),
      }));
      const stage = new URL("planner.tmp", folder);
      writeFileSync(stage, JSON.stringify(tasks), { mode: 0o600 });
      renameSync(stage, share);
    } else rmSync(share, { force: true });
    return reply(200, { revision: next.revision });
  } catch {
    return reply(500, { error: "Workspace was not saved" });
  }
}
