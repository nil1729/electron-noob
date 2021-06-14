const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const sharp = require('sharp');
const byteSize = require('byte-size');
const log = require('electron-log');

const isDev = process.env.NODE_ENV === 'development' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let aboutWindow;

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		title: 'Image Shrinker',
		width: 500,
		height: 600,
		icon: './assets/icons/Icon_256x256.png',
		resizable: isDev,
		webPreferences: {
			devTools: isDev,
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			enableRemoteModule: false, // turn off remote
			preload: path.join(__dirname, 'preload.js'), // use a preload script
		},
		backgroundColor: 'white',
	});

	// if (isDev) {
	// mainWindow.webContents.openDevTools();
	// }

	mainWindow.loadFile(`./app/index.html`);
};

const createAboutWindow = () => {
	aboutWindow = new BrowserWindow({
		title: 'About Image Shrinker',
		width: 300,
		height: 300,
		icon: './assets/icons/Icon_256x256.png',
		resizable: false,
		backgroundColor: 'white',
	});

	aboutWindow.loadFile(`./app/about.html`);
};

app.on('ready', () => {
	createMainWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	mainWindow.on('ready', () => (mainWindow = null));
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

ipcMain.on('toMain', async (event, args) => {
	args.extension = path.extname(args.imagePath);
	const outputDir = `${os.homedir()}/image-shrinker`;

	args.destination = `${outputDir}/${path.basename(args.imagePath, args.extension)}-quality${
		args.quality
	}${args.extension}`;

	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

	const compressedImage = await shrinkImage(args);

	event.sender.send('fromMain', compressedImage);
});

const shrinkImage = async ({ imagePath, quality, destination, extension }) => {
	try {
		let compressedImage;
		if (extension === '.png') {
			compressedImage = await sharp(imagePath).png({ quality }).toFile(destination);
		} else {
			compressedImage = await sharp(imagePath).jpeg({ quality }).toFile(destination);
		}
		compressedImage.outputPath = destination;
		compressedImage.size = `${byteSize(compressedImage.size)}`;
		compressedImage.quality = quality;

		shell.openPath(destination);
		log.info(compressedImage);

		return compressedImage;
	} catch (err) {
		log.error(err);
		return err;
	}
};

console.log(`Electron app started in ${process.env.NODE_ENV} mode`);
