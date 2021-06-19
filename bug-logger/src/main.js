const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const connectDB = require('./utils/db');
const { fetchLogs, addLogItem, deleteLogItem } = require('./utils/crud');

if (require('electron-squirrel-startup')) {
	app.quit();
}

const isDev = process.env.NODE_ENV === 'development' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;
const GITHUB_LINK = 'https://github.com/nil1729';

let mainWindow;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 900,
		height: 700,
		icon: './assets/icon.png',
		backgroundColor: '#FFFFFF',
		show: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js'),
		},
		resizable: isDev,
	});

	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

const menu = [
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{
							label: 'About',
							click: () => {
								shell.openExternal(GITHUB_LINK);
							},
						},
					],
				},
		  ]
		: []),
	{
		role: 'fileMenu',
	},
	...(!isMac
		? [
				{
					label: 'Help',
					submenu: [
						{
							label: 'About',
							click: () => {
								shell.openExternal(GITHUB_LINK);
							},
						},
					],
				},
		  ]
		: []),
	...(isDev
		? [
				{
					label: 'Developer',
					submenu: [
						{ role: 'reload' },
						{ role: 'forceReload' },
						{ type: 'separator' },
						{ role: 'toggleDevTools' },
					],
				},
		  ]
		: []),
];

app.on('ready', () => {
	createWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	connectDB().then(() => {
		mainWindow.show();
		mainWindow.focus();
	});
});

app.on('window-all-closed', () => {
	if (!isMac) {
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
