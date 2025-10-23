import { useStoryblokApi } from '@storyblok/astro';

const getStoryblokRegionLanguageCodes = async () => {
	const storyblokApi = useStoryblokApi();
	const { data } = await storyblokApi.get('cdn/datasource_entries', {
		datasource: 'regions-and-languages',
	});
	return data.datasource_entries;
};

const getRegionCodes = async () => {
	const codes = await getStoryblokRegionLanguageCodes();
	return codes.map((code) => code.name);
};

const getAvailableLanguagesForRegion = async (region) => {
	const codes = await getStoryblokRegionLanguageCodes();
	const languageCodesPerRegion = Object.fromEntries(
		codes.map((code) => [code.name, code.value.split(',')]),
	);
	return languageCodesPerRegion[region] || [];
};

const getLanguageCodes = async () => {
	const storyblokApi = useStoryblokApi();
	const { data } = await storyblokApi.get('cdn/spaces/me');

	return data.space.language_codes;
};

const getCleanSlug = async (slug) => {
	const slugParts = slug.split('/');

	const languages = await getLanguageCodes();
	const regions = await getRegionCodes();

	let languageCode = '';

	if (languages.includes(slugParts[0])) {
		languageCode = slugParts[0];
		slugParts.shift();
	}

	let regionCode = '';
	if (regions.includes(slugParts[0])) {
		regionCode = slugParts[0];
		slugParts.shift();
	}

	return { slug: slugParts.join('/'), languageCode, regionCode };
};

const getTranslatedSlug = async (story, language) => {
	if (!story.translated_slugs) return false;

	const translatedSlug = story.translated_slugs?.find((slug) => {
		return slug.path !== 'home' && slug.lang === language;
	});

	if (!translatedSlug) return false;
	return (await getCleanSlug(translatedSlug.path)).slug;
};

const getInternalLink = async (linkSlug, currentLanguage) => {
	if (!linkSlug) return '';

	const { slug, languageCode, regionCode } = await getCleanSlug(linkSlug);

	const includeRegion =
		regionCode && regionCode !== 'us' ? `${regionCode}/` : '';

	let includeLanguage = '';
	if (languageCode || currentLanguage) {
		includeLanguage = (languageCode || currentLanguage) + '/';
	}

	if (slug === 'home') {
		return `/${includeRegion}${includeLanguage}`;
	}

	return `/${includeRegion}${includeLanguage}${slug}`;
};

export {
	getLanguageCodes,
	getRegionCodes,
	getAvailableLanguagesForRegion,
	getCleanSlug,
	getTranslatedSlug,
	getInternalLink,
};
