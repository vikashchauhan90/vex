const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC and app utilities to the renderer process
contextBridge.exposeInMainWorld('electron', {
  ipc: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    once: (channel, listener) => ipcRenderer.once(channel, listener)
  },
  app: {
    getAppPath: () => process.cwd(),
    getUserDataPath: () => ipcRenderer.sendSync('get-user-data-path')
  }
});
