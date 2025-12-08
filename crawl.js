const { JSDOM } = require('jsdom');

async function crawlPage(currentURL) {
	console.log(`actively crawling: ${currentURL}`);

	try {
		const resp = await fetch(currentURL);

		if (resp.status > 399) {
			console.log(`erros in fetch with status code: ${resp.status} on page: ${currentURL}`);
			return;
		}

		const contentType = resp.headers.get('content-type');
		if (contentType !== 'text/html') {
			console.log(`non html response, content type: ${contentType} on page: ${currentURL}`);
			return;
		}

		console.log(await resp.text());
	} catch (err) {
		console.log(`error in fetch: ${err.message}, on page: ${currentURL}`);
	}
}

function getURLsFromHTML(htmlBody, baseURL) {
	const dom = new JSDOM(htmlBody);
	const linkElements = dom.window.document.querySelectorAll('a');
	const urls = [];

	for (const linkElement of linkElements) {
		let url = linkElement.href;

		url = url.slice(0, 1) === '/' ? `${baseURL}${url}` : url;

		try {
			normalizeURL(url);
			urls.push(url);
		}
		catch (error) {
			continue;
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
	getURLsFromHTML,
	crawlPage,
}