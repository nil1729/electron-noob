const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const osu = require('node-os-utils');
const byteSize = require('byte-size');
var moment = require('moment');
var momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);

process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV === 'development' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let aboutWindow;

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		title: 'SysTop',
		width: 500,
		height: 600,
		icon: './assets/icons/icon.png',
		resizable: false,
		backgroundColor: '#000000',
		webPreferences: {
			devTools: isDev,
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			enableRemoteModule: false, // turn off remote
			preload: path.join(__dirname, 'preload.js'), // use a preload script
		},
	});

	mainWindow.loadFile(`./app/index.html`);
};

const createAboutWindow = () => {
	aboutWindow = new BrowserWindow({
		title: 'About SysTop',
		width: 300,
		height: 300,
		icon: './assets/icons/icon.png',
		resizable: false,
		backgroundColor: 'white',
	});

	aboutWindow.loadFile(`./app/about.html`);
};

app.on('ready', () => {
	createMainWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	mainWindow.on('ready', () => {
		getSystemInfo();
		mainWindow = null;
	});
});

const menu = [
	...(isMac
		? [
				{
					label: app.name,
					submenu: [{ label: 'About', click: createAboutWindow }],
				},
		  ]
		: []),
	{
		role: 'fileMenu',
	},
	...(!isMac ? [{ label: 'Help', submenu: [{ label: 'About', click: createAboutWindow }] }] : []),
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

app.on('activate', function () {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on('window-all-closed', function () {
	if (!isMac) app.quit();
});

const getSystemInfo = () => {
	const systemUptime = moment.duration(os.uptime(), 'seconds').format('d[d], h[h], m[m], s[s]');
	const cpuModel = osu.cpu.model();
	const osInfo = `${os.type()}  ${os.arch()}`;
	const machineName = os.hostname();
	const systemMemory = `${byteSize(os.totalmem())}`;
	return { cpuModel, osInfo, machineName, systemUptime, systemMemory };
};

ipcMain.on('system:info', async (event, args) => {
	event.sender.send('system:info', getSystemInfo());
});

console.log(`Electron app started in ${process.env.NODE_ENV} mode`);
