import path from "path";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  process.env.STANDALONE = "true";
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1400,
    height: 600,
    minWidth: 1350,
    minHeight: 600,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setMenuBarVisibility(false);

  if (isProd) {
    await mainWindow.loadURL("app://./preloader");
    await mainWindow.loadURL(`https://atc-dev.vercel.app/?desktop=1`);
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/preloader`);
    await mainWindow.loadURL(`http://localhost:3000/?desktop=1`);
  }

  ipcMain.on("maximize", (_event, arg) => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on("minimize", (_event, arg) => {
    mainWindow.minimize();
  });
  ipcMain.on("close", (_event, arg) => {
    mainWindow.close();
  });
})();

app.on("window-all-closed", () => {
  app.quit();
});
