import { useStoryblokApi } from '@storyblok/astro';

const getLanguageCodes = async () => {
	const storyblokApi = useStoryblokApi();
	const { data } = await storyblokApi.get('cdn/spaces/me');

	return data.space.language_codes;
};

const getCleanSlug = async (slug) => {
	const slugParts = slug.split('/');

	const languages = await getLanguageCodes();

	let languageCode = '';

	if (languages.includes(slugParts[0])) {
		languageCode = slugParts[0];
		slugParts.shift();
	}

	return { slug: slugParts.join('/'), languageCode };
};

const getTranslatedSlug = async (story, language) => {
	if (!story.translated_slugs) return false;

	const translatedSlug = story.translated_slugs?.find((slug) => {
		return slug.path !== 'home' && slug.lang === language;
	});

	if (!translatedSlug) return false;
	return (await getCleanSlug(translatedSlug.path)).slug;
};

const getInternalLink = async (linkSlug) => {
	if (!linkSlug) return '';

	const { slug, languageCode } = await getCleanSlug(linkSlug);

	let includeLanguage = '';
	if (languageCode) {
		includeLanguage = `${languageCode}/`;
	}

	if (slug === 'home') {
		return `/${includeLanguage}`;
	}

	return `/${includeLanguage}${slug}`;
};

export { getLanguageCodes, getCleanSlug, getTranslatedSlug, getInternalLink };
