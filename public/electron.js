const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

let userFile = `./user_data/${new Date()
  .toJSON()
  .slice(0, 10)}_user_memory.json`;
const productsFile = "./static_products.json";

if (isDev) {
  const devTools = require("electron-devtools-installer");
  installExtension = devTools.default;
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

function createWindow() {
  /**
   * !!!!!!!!!!!!!!!!!!
   * To start: npm run dev
   * !!!!!!!!!!!!!!!!!!
   */
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  let htmlPath = isDev
    ? "http://localhost:3000"
    : url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      });
  win.loadURL(htmlPath);

  // Open the DevTools.
  if (isDev) {
    //win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((error) => console.log(`An error occurred: , ${error}`));
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("writeUserFile", async (event, ...args) => {
  const fs = require("fs");
  const path = require("path");

  // define userFile and args[0] here

  let dir = path.dirname(path.resolve(__dirname, userFile));

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  var json = args[0] + "\n";
  fs.writeFile(
    path.resolve(__dirname, userFile),
    json,
    { encoding: "utf-8" },
    (err) => {
      if (err) throw err;
    }
  );
});

ipcMain.on("asynchronous-message", (event, arg) => {
  event.reply("asynchronous-reply", "pong");
});

ipcMain.handle("readUserFile", async (event, ...args) => {
  const result = await readFile(...args, userFile);
  return result;
});

ipcMain.handle("readProducts", async (event, ...args) => {
  const result = await readFile(productsFile);
  return result;
});

function readFile(filePath) {
  const data = fs.readFileSync(path.resolve(__dirname, filePath), "utf-8");
  let values = JSON.parse(data);
  //console.log(values);
  return values;
}
