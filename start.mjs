import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("./", import.meta.url));
const children = [];
function service(dir, entry, args = [], env = {}) {
  const child = spawn(process.execPath, [entry, ...args], {
    cwd: path.join(root, dir),
    env: {
      ...process.env,
      ...(process.versions.electron ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
      ...env,
    },
    stdio: "inherit",
    windowsHide: true,
  });
  children.push(child);
  child.on("exit", (code) => {
    if (code) console.error(dir + " stopped (" + code + ")");
  });
}
function stop() {
  for (const child of children) child.kill();
}
process.on("exit", stop);
process.on("SIGINT", () => {
  stop();
  process.exit();
});
process.on("SIGTERM", () => {
  stop();
  process.exit();
});
service("fitness/api", "server.js", [], {
  DATA_DIR: process.env.LIFEOS_DATA_DIR || path.join(root, ".private", "gym"),
  ORIGIN: "http://127.0.0.1:5173",
  RP_ID: "127.0.0.1",
});
service(
  "fitness/frontend",
  "node_modules/vite/bin/vite.js",
  ["--host", "127.0.0.1", "--port", "5173", "--strictPort"],
  { API_ORIGIN: "http://127.0.0.1:5173" },
);
service(".", "server.mjs");

process.on("message", (m) => {
  if (m === "shutdown") {
    stop();
    process.exit();
  }
});
