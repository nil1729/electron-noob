const tabs = document.querySelectorAll('nav ul li.tab');
const tabContents = document.querySelectorAll('main .content');
const navTools = document.querySelector('nav');

const resetTab = () => tabs.forEach((tab) => tab.classList.remove('is-active'));

tabs.forEach(function (tab) {
	tab.addEventListener('click', function () {
		resetTab();
		this.classList.add('is-active');
		const currentTab = this.id;
		tabContents.forEach(function (content) {
			if (content.classList.contains(currentTab)) {
				content.classList.add('is-active');
			} else {
				content.classList.remove('is-active');
			}
		});
	});
});

window['cpu:monitor'].receive('nav:toggle', (info) => {
	if (navTools.classList.contains('hide')) {
		navTools.classList.remove('hide');
	} else {
		navTools.classList.add('hide');
	}
});
