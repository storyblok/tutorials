import { useStoryblokApi } from '@storyblok/astro';
import { getCleanSlug, getLanguageCodes } from './i18n';
export async function getStoryblokPaths(region = 'us') {
	const languages = await getLanguageCodes();
	const storyblokApi = useStoryblokApi();

	const links = await storyblokApi.getAll('cdn/links', {
		version: 'draft',
		starts_with: region,
	});

	const staticPaths = [];

	for await (const link of links) {
		if (link.is_folder) continue;
		const cleanSlug = await getCleanSlug(link.slug);

		staticPaths.push({
			params: {
				slug: cleanSlug.slug === 'home' ? undefined : cleanSlug.slug,
			},
		});

		// These alternates are for field-level versions of the slug.
		if (link.alternates && link.alternates.length > 0) {
			for await (const alternate of link.alternates) {
				if (languages.includes(alternate.lang)) {
					const cleanSlug = await getCleanSlug(alternate.translated_slug);
					staticPaths.push({
						params: {
							slug: `${alternate.lang}/${cleanSlug.slug === 'home' ? '' : cleanSlug.slug}`,
						},
					});
				}
			}
		}
	}

	console.log(
		`Generated ${staticPaths.length} static paths for region: ${region}`,
	);
	console.log(staticPaths);

	return staticPaths;
}
