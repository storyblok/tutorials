export default async function (slug) {
	let language = null;
	const languageCodes = ref();
	const storyblokApi = useStoryblokApi();

	/**
	 * Request all languages set up in the space.
	 */
	const { data } = await storyblokApi.get('cdn/spaces/me');
	languageCodes.value = data.space.language_codes;

	/**
	 * If the the first part of the slug array matches a language code defined in the space,
	 * it returns the language code specified for the story/stories.
	 */
	if (languageCodes.value.includes(slug[0])) {
		language = slug[0];
	}

	return language;
}
