const cpuModel = document.querySelector('#cpu-model');

window.onload = () => {
	window['cpu:monitor'].send('system:info');
};

window['cpu:monitor'].receive('system:info', (info) => {
	Object.keys(info).forEach((key) => {
		document.querySelector('#' + key).textContent = info[key];
	});
});
