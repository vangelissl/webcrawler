const { JSDOM } = require('jsdom');

async function crawlPage(baseURL, currentURL, pages) {
	console.log(`actively crawling: ${currentURL}`);

	const baseURLObj = new URL(baseURL);
	const currentURLObj = new URL(currentURL);
	if (baseURLObj.hostname !== currentURLObj.hostname) {
		return pages;
	}

	const normalizedCurrentURL = normalizeURL(currentURL);
	if (pages[normalizedCurrentURL] > 0) {
		pages[normalizedCurrentURL]++;
		return pages;
	}

	pages[normalizedCurrentURL] = 1; 

	try {
		const resp = await fetch(currentURL);

		if (resp.status > 399) {
			console.log(`erros in fetch with status code: ${resp.status} on page: ${currentURL}`);
			return pages;
		}

		const contentType = resp.headers.get('content-type');
		if (!contentType.includes('text/html')) {
			console.log(`non html response, content type: ${contentType} on page: ${currentURL}`);
			return pages;
		}

		const htmlBody = await resp.text();
		const nextURLs = getURLsFromHTML(htmlBody, baseURL);
		
		for(const nextURL of nextURLs){
			pages = await crawlPage(baseURL, nextURL, pages);
		}

		return pages;

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