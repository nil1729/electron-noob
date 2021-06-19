const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bug:logger', {
	fetchLogs: ipcRenderer.invoke('getLogs'),
	addLog: (logItem) => ipcRenderer.invoke('addLog', logItem),
	removeLog: (id) => ipcRenderer.invoke('removeLog', id),
});
