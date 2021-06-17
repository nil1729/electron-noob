const cpuModel = document.querySelector('#cpu-model');
const settingForm = document.querySelector('form.setting-form');
const cpuOverloadInput = document.querySelector('#cpu-overload');
const alertFrequencyInput = document.querySelector('#alert-frequency');
const settingsConfirmationAlert = document.querySelector('#alert-message');

const cpuOverload = 10;

window.onload = () => {
	window['cpu:monitor'].send('system:info');
};

window['cpu:monitor'].receive('system:info', (info) => {
	Object.keys(info).forEach((key) => {
		if (document.querySelector('#' + key))
			document.querySelector('#' + key).textContent = info[key];
	});

	cpuOverloadInput.value = info.settingInfo.cpuOverload.toFixed(2);
	alertFrequencyInput.value = info.settingInfo.alertFrequency.toFixed(2);
});

window['cpu:monitor'].receive('cpu:usage', (info) => {
	Object.keys(info).forEach((key) => {
		if (document.querySelector('#' + key))
			document.querySelector('#' + key).textContent = info[key];
	});

	// Indicator Stuffs
	const usageIndicator = document.querySelector('.usage-indicator');

	usageIndicator.style.width = info.cpuPercentage;

	if (info.cpuOverloaded) {
		usageIndicator.classList.add('overloaded');
	} else {
		usageIndicator.classList.remove('overloaded');
	}
});

settingForm.addEventListener('submit', function (e) {
	e.preventDefault();

	cpuOverloadInput.value = Number(cpuOverloadInput.value).toFixed(2);
	alertFrequencyInput.value = Number(alertFrequencyInput.value).toFixed(2);

	window['cpu:monitor'].send('setting:form', {
		cpuOverload: cpuOverloadInput.value,
		alertFrequency: alertFrequencyInput.value,
	});

	settingsConfirmationAlert.textContent = 'Settings Saved';
	settingsConfirmationAlert.parentElement.classList.add('show');
	setTimeout(() => {
		settingsConfirmationAlert.parentElement.classList.remove('show');
	}, 3000);
});
