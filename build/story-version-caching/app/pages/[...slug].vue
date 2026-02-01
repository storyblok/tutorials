<script setup lang="ts">
const slug = useRoute().params.slug;

const { data: cachedStory, error } = await useAsyncData(
	`story:${slug}`,
	() => $fetch(`/api/story/${encodeURIComponent(slug && slug.length > 0 ? slug.join('/') : 'home')}`),
	{ server: true },
);

if (error.value) throw error.value;
if (!cachedStory.value)
	throw createError({ message: 'Story not found', statusCode: 404 });
</script>

<template>
  <StoryblokComponent v-if="cachedStory" :blok="cachedStory.content" />
</template>
