const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const connectDB = require('./utils/db');
const { fetchLogs, addLogItem, deleteLogItem } = require('./utils/crud');

if (require('electron-squirrel-startup')) {
	app.quit();
}

let mainWindow;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		backgroundColor: '#FFFFFF',
		show: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
	createWindow();
	connectDB().then(() => {
		mainWindow.show();
		mainWindow.focus();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

ipcMain.handle('getLogs', async (e) => {
	return fetchLogs();
});

ipcMain.handle('addLog', async (event, args) => {
	return addLogItem(args);
});

ipcMain.handle('removeLog', async (event, id) => {
	return deleteLogItem(id);
});
