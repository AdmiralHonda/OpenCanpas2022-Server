const path = require('path')
const {shell, app, BrowserWindow, ipcMain, dialog, ipcRenderer } = require('electron')

//gRPC用変数宣言
var PROTO_PATH = __dirname + '/../proto/rec_recipe.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var test_proto = grpc.loadPackageDefinition(packageDefinition);
var client = new test_proto.RecRecipe('localhost:50051', grpc.credentials.createInsecure());

function createWindow() {
  const win = new BrowserWindow({
    width: 640,
    height: 960,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  })

  win.setMenuBarVisibility(false)
  win.loadFile('./htmlfiles/index.html')
  if (!app.isPackaged) win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('fixname', async (event, args) => {
  const datas = await new Promise((resolve) => {
    client.fix_name({ query: args.userInput }, async (err, response) => {
      resolve({
        match: response.match,
        sim_word_list: response.sim_word_list
      })
    });
  })
  console.log("datas:");
  console.log(datas);
  return datas;
});

ipcMain.handle('getunitlist', async (event, args) => {
  const datas = await new Promise((resolve) => {
    client.get_unit_list({ query: args.userInput }, async (err, response) => {
      resolve({
        units: response.units //list
      })
    });
  })
  console.log("datas:");
  console.log(datas);
  return datas;
});

ipcMain.handle('exchangetog', async (event, args) => {
  const datas = await new Promise((resolve) => {
    client.exchange_to_g({ name: args.name, unit: args.unit, amount: args.amount }, async (err, response) => {
      resolve(
        {
          id: response.id,
          name: response.name,
          amount: response.amount
        }//dict
      )
    });
  })
  console.log("datas:");
  console.log(datas);
  return datas;
});

ipcMain.handle('getrecipe', async (event, args) => {
  const datas = await new Promise((resolve) => {
    client.get_recipe({ ingredients: args.ingredients }, async (err, response) => {
      resolve({
        title: response.title, //dict
        url: response.url
      })
    });
  })
  shell.openExternal(datas.url);
  console.log("datas:");
  console.log(datas);
  return datas;
});

/*
ipcMain.handle('throwerr', async (event, args) => {
  dialog.showMessageBoxSync(null, { message: "someError" })
});
*/