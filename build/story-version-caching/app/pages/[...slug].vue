<script setup lang="ts">
const slug = await getProcessedSlug()

const { data: cachedStory, error } = await useAsyncData(
  `story:${slug}`,
  () => $fetch(`/api/story/${encodeURIComponent(slug)}`),
  { server: true }
)

if (error.value) throw error.value
if (!cachedStory.value) throw createError({ statusCode: 404, message: 'Story not found' })
</script>

<template>
  <StoryblokComponent v-if="cachedStory" :blok="cachedStory.content" />
</template>
