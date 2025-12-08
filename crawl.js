const { JSDOM } = require('jsdom');

function getURLsFromHTML(htmlBody, baseURL) {
	const dom = new JSDOM(htmlBody);
	const linkElements = dom.window.document.querySelectorAll('a');
	const urls = [];

	for (const linkElement of linkElements) {
		if (linkElement.href.slice(0, 1) === '/') {
			console.log('yes')
			urls.push(`${baseURL}${linkElement.href}`);
		}
		else {
			urls.push(linkElement.href);
		}
	}

	return urls;
}

function normalizeURL(urlString) {
	const urlObj = new URL(urlString);
	const hostPath = `${urlObj.hostname}${urlObj.pathname}`;

	if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
		return hostPath.slice(0, -1);
	}

	return hostPath;
}

module.exports = {
	normalizeURL,
	getURLsFromHTML
}