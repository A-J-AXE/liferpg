import { authorized, workspace } from "./cloud.mjs";
import http from "node:http";
import { calendarAPI } from "./google.mjs";
import { snapshot } from "./snapshot.mjs";
import { availability } from "./booking.mjs";
import { readFile } from "node:fs/promises";
const files = {
  "/": "index.html",
  "/app.js": "app.js",
  "/style.css": "style.css",
};
http
  .createServer(async (req, res) => {
    const hosted = Boolean(process.env.PUBLIC_ORIGIN);
    if (hosted && !authorized(req)) {
      res
        .writeHead(401, {
          "WWW-Authenticate": 'Basic realm="LifeOS"',
          "Cache-Control": "no-store",
        })
        .end("Owner login required");
      return;
    }
    if (req.url === "/runtime.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end("window.lifeosHosted=" + hosted + ";");
      return;
    }
    if (hosted && req.url === "/workspace") {
      return workspace(req, res);
    }
    const name = files[new URL(req.url, "http://localhost").pathname];
    if (req.url === "/availability" || req.url.startsWith("/book/"))
      return availability(req, res, new URL(req.url, "http://localhost"));
    if (req.url === "/mcp/share") return snapshot(req, res);
    if (req.url.startsWith("/google/"))
      return calendarAPI(req, res, new URL(req.url, "http://localhost"));
    if (!name) {
      res.writeHead(404).end();
      return;
    }
    try {
      const data = await readFile(new URL(name, import.meta.url));
      res.setHeader(
        "Content-Type",
        name.endsWith("js")
          ? "text/javascript"
          : name.endsWith("css")
            ? "text/css"
            : "text/html",
      );
      res.end(data);
    } catch {
      res.writeHead(500).end();
    }
  })
  .listen(4310, process.env.PUBLIC_ORIGIN ? "0.0.0.0" : "127.0.0.1", () =>
    console.log("LifeOS: http://127.0.0.1:4310"),
  );
