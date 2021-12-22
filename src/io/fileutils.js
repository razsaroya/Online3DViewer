export let FileSource =
{
    Url : 1,
    File : 2,
	Decompressed : 3
};

export let FileFormat =
{
    Text : 1,
    Binary : 2
};

export function GetFileName  (filePath)
{
	let firstSeparator = filePath.lastIndexOf ('/');
	if (firstSeparator === -1) {
		firstSeparator = filePath.lastIndexOf ('\\');
	}
	let fileName = filePath;
	if (firstSeparator !== -1) {
		fileName = filePath.substr (firstSeparator + 1);
	}
	let firstParamIndex = fileName.indexOf ('?');
	if (firstParamIndex !== -1) {
		fileName = fileName.substr (0, firstParamIndex);
	}
	return decodeURI (fileName);
};

export function GetFileExtension  (filePath)
{
	let fileName = GetFileName (filePath);
	let firstPoint = fileName.lastIndexOf ('.');
	if (firstPoint === -1) {
		return '';
	}
	let extension = fileName.substr (firstPoint + 1);
	return extension.toLowerCase ();
};

export function RequestUrl  (url, format)
{
	return new Promise ((resolve, reject) => {
		let request = new XMLHttpRequest ();
		request.open ('GET', url, true);
		if (format === FileFormat.Text) {
			request.responseType = 'text';
		} else if (format === FileFormat.Binary) {
			request.responseType = 'arraybuffer';
		} else {
			reject ();
			return;
		}
	
		request.onload = function () {
			if (request.status === 200) {
				resolve (request.response);
			} else {
				reject ();
			}
		};
		
		request.onerror = function () {
			reject ();
		};
	
		request.send (null);
	});
};

export function ReadFile  (file, format)
{
	return new Promise ((resolve, reject) => {
		let reader = new FileReader ();

		reader.onloadend = function (event) {
			if (event.target.readyState === FileReader.DONE) {
				resolve (event.target.result);
			}
		};
		
		reader.onerror = function () {
			reject ();
		};

		if (format === FileFormat.Text) {
			reader.readAsText (file);
		} else if (format === FileFormat.Binary) {
			reader.readAsArrayBuffer (file);
		} else {
			reject ();
		}
	});
};

