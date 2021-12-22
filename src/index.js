import Website from './website/o3dv/js/website.js';

window.addEventListener ('load', () => {

	let website = new Website ({
		headerDiv : document.getElementById ('header'),
		toolbarDiv : document.getElementById ('toolbar'),
		mainDiv : document.getElementById ('main'),
		introDiv : document.getElementById ('intro'),
		navigatorDiv : document.getElementById ('main_navigator'),
		navigatorSplitterDiv : document.getElementById ('main_navigator_splitter'),
		sidebarDiv : document.getElementById ('main_sidebar'),
		sidebarSplitterDiv : document.getElementById ('main_sidebar_splitter'),
		viewerDiv : document.getElementById ('main_viewer'),
		fileInput : document.getElementById ('open_file'),
		eventHandler : window.gtagEventHandler
	});
	website.Load ();
});