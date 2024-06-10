const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require('fs');

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS;

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
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  let htmlPath = isDev
    ? "http://localhost:3000"
    : url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    });
    //: `file:///${path.join(__dirname, "/index.html")}`;
  //console.log("Html path "+`file:///${path.join(__dirname, "index.html")}`);
  
  // dialog.showMessageBox(win, {
  //   buttons: ["Yes","No","Cancel"],
  //   message: "Html path "+ htmlPath
  // });

  win.loadURL(htmlPath);

  // Open the DevTools.
  if (isDev) 
  {
    //win.webContents.openDevTools({ mode: "detach" });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(()=>{
  createWindow();	
  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(error => console.log(`An error occurred: , ${error}`));
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const userFile = './user_memory.json';
const productsFile = './static_products.json';

function writeFile(jsonObj) {

  // STEP 1: Reading JSON file
const users = require("./users");
   
// Defining new user
let user = {
    name: "New User",
    age: 30,
    language: ["PHP", "Go", "JavaScript"]
};
   
// STEP 2: Adding new data to users object
users.push(user);
   
// STEP 3: Writing to a file
fs.writeFile("users.json", JSON.stringify(users), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});

  fs.writeFile(
    path.resolve(__dirname, userFile),
    jsonObj,
    (err) => {
      if (err) throw err;

      //return callback(err);
    }
  );
}

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.reply('asynchronous-reply', 'pong');
});


ipcMain.handle('readUserFile', async (event, ...args) => {
  const result = await readFile(...args, userFile);
  return result;
});

ipcMain.handle('readProducts', async (event, ...args) => {
  const result = await readFile(productsFile);
  return result;
});

function readFile(filePath)
{
  //console.log(callback);
  
  const data = fs.readFileSync(
    path.resolve(__dirname, filePath),
    'utf-8');
    /*,
    (err, data) => {
		  console.log("reading file "+userFile);
		  console.log(err);
      
      if (err) throw err;
      */
      let values = JSON.parse(data);//.toString().split('\n');
		  console.log(values);
      return values;
		  /*console.log(values);

      listItems = values.map(val => {val}); 
		  console.log(listItems);

      return listItems;
    }
  );*/

}