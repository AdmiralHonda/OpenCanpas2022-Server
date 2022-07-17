const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    "requires", {
    ipcRenderer: ipcRenderer, //レンダラー側にNodeメインプロセス側のipcRendererモジュールを渡すことを許可
}
);