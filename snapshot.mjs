import { mkdir, rm, writeFile, rename } from "node:fs/promises";
import { randomUUID } from "node:crypto";
const folder = new URL("./.private/", import.meta.url);
const dest = new URL("planner.json", folder);
export async function snapshot(req, res) {
  if (
    req.method !== "POST" ||
    req.headers.origin !==
      (process.env.PUBLIC_ORIGIN || "http://127.0.0.1:4310") ||
    req.headers.host !==
      new URL(process.env.PUBLIC_ORIGIN || "http://127.0.0.1:4310").host
  ) {
    res.writeHead(403).end();
    return;
  }
  try {
    let data = "";
    for await (const buf of req) {
      data += buf;
      if (data.length > 2000000) {
        res.writeHead(413).end();
        return;
      }
    }
    const body = JSON.parse(data);
    await mkdir(folder, { recursive: true });
    if (body.enabled) {
      const temp = new URL(randomUUID() + ".json", folder);
      await writeFile(temp, JSON.stringify(body.tasks), { mode: 0o600 });
      await rename(temp, dest);
    } else await rm(dest, { force: true });
    res.writeHead(204).end();
  } catch {
    res.writeHead(400).end();
  }
}
