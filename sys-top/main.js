const { app, BrowserWindow, Menu, ipcMain, Notification, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const osu = require('node-os-utils');
const byteSize = require('byte-size');
const Store = require('./Store');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);
const APP_TITLE = 'SysTop';
const APP_VERSION = '1.0.0';

process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV === 'development' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let tray;

// First instantiate the class
const store = new Store({
	configName: 'user-settings',
	defaults: {
		cpuOverload: 75.0,
		alertFrequency: 5.0,
	},
});

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		title: APP_TITLE,
		width: 500,
		height: 600,
		icon: './assets/icons/icon.png',
		resizable: false,
		backgroundColor: '#000000',
		opacity: 0.98,
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
	new BrowserWindow({
		title: 'About ' + APP_TITLE,
		width: 300,
		height: 300,
		icon: './assets/icons/icon.png',
		resizable: false,
		backgroundColor: 'white',
		webPreferences: {
			devTools: isDev,
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			enableRemoteModule: false, // turn off remote
			preload: path.join(__dirname, 'preload.js'), // use a preload script
		},
	}).loadFile(`./app/about.html`);
};

app.on('ready', () => {
	app.setAppUserModelId(APP_TITLE);
	createMainWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	tray = new Tray('./assets/icons/tray_icon.png');
	tray.setToolTip(APP_TITLE);

	tray.on('click', () => {
		if (mainWindow.isVisible()) {
			mainWindow.hide();
			hideWindows();
		} else {
			mainWindow.show();
		}
	});

	tray.setContextMenu(
		Menu.buildFromTemplate([
			{
				label: 'Quit',
				click: () => {
					app.isQuitting = true;
					app.quit();
				},
			},
		])
	);

	mainWindow.on('close', (e) => {
		if (!app.isQuitting) {
			e.preventDefault();
			mainWindow.hide();
			hideWindows();
		}

		return true;
	});

	mainWindow.on('ready', () => (mainWindow = null));
});

const hideWindows = () => {
	BrowserWindow.getAllWindows().forEach((win) => {
		if (win.isVisible) {
			win.hide();
		}
	});
};

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
	{
		label: 'View',
		submenu: [
			{
				label: 'Toggle Navigation Tools',
				click: () => {
					mainWindow.webContents.send('nav:toggle');
				},
			},
		],
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
	const cpuModel = osu.cpu.model();
	const osInfo = `${os.type()}  ${os.arch()}`;
	const machineName = os.hostname();
	const systemMemory = `${byteSize(os.totalmem())}`;
	const settingInfo = {
		cpuOverload: store.get('cpuOverload'),
		alertFrequency: store.get('alertFrequency'),
	};

	return { cpuModel, osInfo, machineName, systemMemory, settingInfo };
};

ipcMain.on('system:info', async (event, args) => {
	event.sender.send('system:info', getSystemInfo());
	sendCPUStats();
	setInterval(sendCPUStats, 2500);
});

const sendCPUStats = () => {
	const getCpuUsage = Promise.all([osu.cpu.usage(), osu.cpu.free()]);
	getCpuUsage.then((usageInfo) => {
		const cpuPercentage = usageInfo[0].toFixed(2) + '%';
		const freePercentage = usageInfo[1].toFixed(2) + '%';
		const maxCpuUsage = store.get('cpuOverload');
		const cpuOverloaded = maxCpuUsage <= usageInfo[0];
		const systemUptime = moment.duration(os.uptime(), 'seconds').format('d[d], h[h], m[m], s[s]');

		if (cpuOverloaded) notifyUser(cpuPercentage, maxCpuUsage);

		mainWindow.webContents.send('cpu:usage', {
			cpuPercentage,
			freePercentage,
			systemUptime,
			cpuOverloaded,
		});
	});
};

ipcMain.on('setting:form', async (event, args) => {
	store.set('cpuOverload', Number(args.cpuOverload));
	store.set('alertFrequency', Number(args.alertFrequency));
});

ipcMain.on('version:info', async (event, args) => {
	event.sender.send('version:info', getVersionInfo());
});

const getVersionInfo = () => {
	return {
		electron: process.versions.electron,
		node: process.versions.node,
		chrome: process.versions.chrome,
		app: APP_VERSION,
	};
};

const notifyUser = (usage, maxUsage) => {
	let lastNotified = store.get('lastNotified');
	let alertFrequency = store.get('alertFrequency');

	if (!isNaN(new Date(lastNotified).getTime())) {
		let duration = new Date() - new Date(lastNotified);
		if (duration < alertFrequency * 60 * 1000) return;
	}

	new Notification({
		title: 'CPU Overloaded',
		icon: './assets/icons/icon.png',
		urgency: 'critical',
		body: `Your CPU usage crossed maximum usage limit ${maxUsage}%. Current CPU usage is: ${usage}`,
	}).show();

	store.set('lastNotified', new Date());
};

console.log(`Electron app started in ${process.env.NODE_ENV} mode`);
