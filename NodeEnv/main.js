const path = require('path')
const { app, BrowserWindow, ipcMain, dialog, ipcRenderer} = require('electron')

//gRPC用変数宣言
var PROTO_PATH = __dirname + '/../proto/rec_recipe.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
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


/*
ipcMain.handle('test', async (event, args) => {
  var datas = {};
  console.log(args.userInput);
  client.fix_name({query: args.userInput}, async function(err, response) {
    console.log("response:");
    console.log(response);
    //return {datas: response} //ここでreturnするとコールバック関数内のreturnになってしまう
    datas = {match:response.match,sim_word_list:response.sim_word_list};
    })
  console.log("datas:");
  console.log(datas)
  return datas;
  //return await {results: {match:datas[0],sim_word_list:datas[1]}}
})
*/

ipcMain.handle('test', async (event, args) => {
  // var datas = {};
  // console.log(args.userInput);
  const datas = await new Promise((resolve) => {
    client.fix_name({query: args.userInput}, async (err, response) => {
      resolve({
        match: response.match,
        sim_word_list: response.sim_word_list
      })
    });
  })
  console.log("datas:");
  console.log(datas);
  return datas; //このdatasが2行目の結果を返してしまう = コールバック関数のdatasの代入が上手く行かない
});

/*
ipcMain.handle('epubopen', async (event) => {
  let mes = "_a_a"
  dialog.showMessageBoxSync(null, { message: mes })
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Documents', extensions: ['zip'] }]
  })
  if (canceled) return { canceled, data: [] }
  //console.log(filePaths)
  return { canceled, data: [filePaths] }
})
*/

/*
ipcMain.handle('unzip', async (event, args) => {
  //console.log(args.zipPath)
  if (!path.extname(args.zipPath).toLowerCase === '.zip' && !path.extname(args.zipPath).toLowerCase === '.epub') {
    let mes = "ファイルを指定してください"
    dialog.showMessageBoxSync(null, { message: mes })
    return { canceled: true, data: [''] }
  }
  if (!fs.existsSync(args.zipPath)) {
    let mes = "指定されたファイルが見つかりませんでした"
    dialog.showMessageBoxSync(null, { message: mes })
    return { canceled: true, data: [''] }
  }
  else {
    const fileStat = fs.statSync(args.zipPath)
    if (fileStat.isDirectory()) {
      let mes = "指定されたパスはフォルダのようです"
      dialog.showMessageBoxSync(null, { message: mes })
      return { canceled: true, data: [''] }
    }
  }
});
*/
