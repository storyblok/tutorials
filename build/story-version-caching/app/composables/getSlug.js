export default async function () {
	const route = useRoute();

	let slug = [];
	if (route.query.path) {
		/**
		 * Check if the path URL parameter is provided.
		 * Note: This is needed for demo spaces.
		 */
		slug = route.query.path?.split('/');
	} else {
		/**
		 * If there's no path parameter provided, retrieve the slug.
		 */
		if (route.params?.slug) {
			slug = route.params.slug.slice();
		}
	}

	return slug;
}
