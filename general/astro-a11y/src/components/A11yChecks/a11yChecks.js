export function findMultipleH1s() {
	const h1s = Array.from(document.querySelectorAll('h1'));
	return h1s.slice(1);
}

export function findSkippedHeadingLevels() {
	const allHeadings = Array.from(
		document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
	);

	let previousHeadingLevel = 6;
	return allHeadings.filter((heading) => {
		const headingLevel = Number(heading.tagName.slice(1));
		const result = headingLevel > previousHeadingLevel + 1;
		previousHeadingLevel = headingLevel;
		return result;
	});
}
