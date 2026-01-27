export default async function () {
	let slug = await getSlug();

	if (slug) {
		const language = await getLanguage(slug);
		/**
		 * If a specific language is requested, remove the first part of the slug (the language code).
		 */
		if (language) {
			slug = slug.slice(1);
		}
		slug = slug.join('/');
	} else {
		slug = 'home';
	}
	if (slug === '') {
		slug = 'home';
	}

	return slug;
}
