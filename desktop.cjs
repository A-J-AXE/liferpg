const { app, BrowserWindow } = require("electron");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
let window;
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("login", (event, _contents, _details, auth, callback) => {
    const configured = process.env.LIFEOS_SERVER_URL;
    if (
      configured &&
      auth.host === new URL(configured).hostname &&
      auth.realm === "LifeOS" &&
      process.env.LIFEOS_OWNER_PASSWORD
    ) {
      event.preventDefault();
      callback("owner", process.env.LIFEOS_OWNER_PASSWORD);
    }
  });
  app.on("second-instance", () => window?.focus());
  app
    .whenReady()
    .then(async () => {
      process.env.LIFEOS_DATA_DIR = path.join(
        app.getPath("userData"),
        "fitness",
      );
      const remote = process.env.LIFEOS_SERVER_URL;
      if (remote && new URL(remote).protocol !== "https:")
        throw Error("Use the HTTPS address of your Spark");
      if (!remote)
        await import(pathToFileURL(path.join(__dirname, "start.mjs")).href);
      const url = remote || "http://127.0.0.1:4310";
      for (let i = 0; !remote && i < 80; i++) {
        try {
          if ((await fetch(url)).ok) break;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      window = new BrowserWindow({
        width: 1440,
        height: 960,
        minWidth: 640,
        minHeight: 500,
        title: "LifeOS",
        autoHideMenuBar: true,
        webPreferences: {
          sandbox: true,
          contextIsolation: true,
          nodeIntegration: false,
        },
      });
      window.webContents.setWindowOpenHandler(({ url: link }) => {
        if (remote && link.startsWith(new URL("/gym/", remote).href))
          require("electron").shell.openExternal(link);
        return { action: "deny" };
      });
      await window.loadURL(url);
    })
    .catch((err) => {
      console.error(err);
      app.quit();
    });
  app.on("window-all-closed", () => app.quit());
}
