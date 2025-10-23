import StoryblokClient from 'storyblok-js-client';

export default class bulkUpdateAiSeo {
	constructor(settings) {
		this.space_id = settings.space_id;
		this.content_type_block = settings.content_type_block;
		this.ai_seo_field = settings.ai_seo_field;
		this.ai_api_url = settings.ai_api_url;
		this.ai_api_token = settings.ai_api_token;
		this.custom_prompt = settings.custom_prompt;

		// Management API client for all operations
		this.client = new StoryblokClient({
			oauthToken: settings.token,
			// region: 'us'
		});
	}

	/**
	 * Fetch stories with the specified content type block that have the AI SEO field
	 */
	async fetchStoriesByContentType(page = 1, per_page = 25) {
		try {
			const response = await this.client.get(
				`spaces/${this.space_id}/stories`,
				{
					filter_query: {
						component: { in: this.content_type_block },
					},
					page,
					per_page,
					story_only: true,
				},
			);
			return {
				per_page: response.per_page,
				stories: response.data.stories,
				total: response.total,
			};
		} catch (error) {
			console.error(`Error fetching stories: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Fetch all stories with pagination
	 */
	async fetchAllStories() {
		let allStories = [];
		let page = 1;
		let hasMore = true;

		console.log(`Fetching stories of content type block ${this.content_type_block}`);

		while (hasMore) {
			const result = await this.fetchStoriesByContentType(page);
			allStories = allStories.concat(result.stories);

			console.log(
				`Fetched page #${page} with ${result.stories.length} stories`,
			);

			hasMore = result.stories.length === result.per_page;
			page++;
		}

		console.log(`Total stories found: ${allStories.length}`);
		return allStories;
	}

	/**
	 * Generate AI content for SEO fields
	 */
	async generateAiSeoContent(storyContent, storyName) {
		if (!this.ai_api_url || !this.ai_api_token) {
			throw new Error(
				`AI API URL and token are required for content generation`,
			);
		}

		try {
			// Create a prompt that includes the story content and custom instructions
			const prompt = `${this.custom_prompt}

Story Title: ${storyName}
Story Content: ${JSON.stringify(storyContent, null, 2)}

Generate SEO content in the following JSON format:
{
  "title": "SEO optimized title (max 60 characters)",
  "description": "SEO meta description (max 160 characters)",
  "keywords": "comma-separated keywords",
  "og:title": "Open Graph title (max 60 characters)",
  "og:description": "Open Graph description (max 160 characters)",
  "twitter:title": "Twitter title (max 70 characters)",
  "twitter:description": "Twitter description (max 200 characters)"
}`;

			// Make a request to the AI API. This is a generic structure for Anthropic models that you can adapt to other AI APIs
			const aiResponse = await (
				await fetch(this.ai_api_url, {
					body: JSON.stringify({
						max_tokens: 1000,
						messages: [{ content: prompt, role: 'user' }],
						model: 'claude-opus-4-20250514',
					}),
					headers: {
						'anthropic-version': '2023-06-01',
						'Content-Type': 'application/json',
						'x-api-key': this.ai_api_token,
					},
					method: 'POST',
				})
			).json();

			if (!aiResponse) {
				throw new Error(
					`AI API request failed: ${aiResponse.status} ${aiResponse.statusText}`,
				);
			}
			// Parse the AI response. You may need to adjust it based on your AI API response format
			let generatedContent;
			try {
				// Assuming the AI returns the content in a 'content' or 'choices' field
				const aiText = aiResponse.content[0].text
					.replace('```json', '')
					.replace('```', '')
					.trim();
				generatedContent = JSON.parse(aiText);
			} catch (parseError) {
				console.error(`Error parsing AI response: ${parseError.message}`);
				console.log(`AI Response: ${aiResponse}`);
				throw new Error(`Failed to parse AI generated content as JSON`);
			}

			return generatedContent;
		} catch (error) {
			console.error(
				`Error generating AI content for "${storyName}":\n${error.message}`,
			);
			throw error;
		}
	}

	/**
	 * Create the complete SEO field content with AI-generated and default values
	 */
	createSeoFieldContent(aiGeneratedContent, existingContent = {}) {
		// biome-ignore assist/source/useSortedKeys: breaks the logic
		return {
			// AI-generated fields
			description: aiGeneratedContent.description || '',
			keywords: aiGeneratedContent.keywords || '',
			'og:description': aiGeneratedContent['og:description'] || '',
			'og:title': aiGeneratedContent['og:title'] || '',
			title: aiGeneratedContent.title || '',
			'twitter:description': aiGeneratedContent['twitter:description'] || '',
			'twitter:title': aiGeneratedContent['twitter:title'] || '',

			// Preserve existing values or set defaults for non-AI fields
			author: existingContent.author || '',
			'advanced:alternate': existingContent['advanced:alternate'] || '',
			'advanced:canonical': existingContent['advanced:canonical'] || '',
			'advanced:charset': existingContent['advanced:charset'] || '',
			'advanced:content-type': existingContent['advanced:content-type'] || '',
			'advanced:refresh': existingContent['advanced:refresh'] || '',
			'advanced:robots': existingContent['advanced:robots'] || '',
			'advanced:viewport': existingContent['advanced:viewport'] || '',
			'og:image': existingContent['og:image'] || '',
			'og:url': existingContent['og:url'] || '',
			'twitter:card': existingContent['twitter:card'] || 'summary_large_image',
			'twitter:image': existingContent['twitter:image'] || '',
		};
	}

	/**
	 * Update a single story with AI-generated SEO content
	 */
	async updateStorySeo(story) {
		try {
			console.log(`Processing story "${story.name}" (ID: ${story.id})`);

			// Fetch full story using the Management API
			const mapiResponse = await this.client.get(
				`spaces/${this.space_id}/stories/${story.id}`,
			);
			const fullStory = mapiResponse.data.story;

			// Generate AI content
			const aiGeneratedContent = await this.generateAiSeoContent(
				fullStory.content,
				story.name,
			);

			// Create the complete SEO field content
			const updatedSeoContent = this.createSeoFieldContent(
				aiGeneratedContent,
				fullStory.content[this.ai_seo_field] || {},
			);

			// Update the story
			const cleanedContent = this.cleanContent(fullStory.content);
			cleanedContent[this.ai_seo_field] = updatedSeoContent;

			const updatedStory = {
				...fullStory,
				content: cleanedContent,
			};

			await this.client.put(`spaces/${this.space_id}/stories/${story.id}`, {
				force_update: 1,
				story: updatedStory,
			});

			console.log(`✔︎ Successfully updated ${story.name}`);
			return { success: true, updatedFields: Object.keys(aiGeneratedContent) };
		} catch (error) {
			console.error(`❌ Error updating "${story.name}": ${error.message}`);
			return { error: error.message, success: false };
		}
	}

	/**
	 * Clean the content object by removing specific fields
	 */
	cleanContent(content) {
		if (!content || typeof content !== 'object') {
			return content;
		}

		const cleanedContent = {};

		for (const [key, value] of Object.entries(content)) {
			// Skip fields that start with an underscore (such as _uid, _editable, etc.)
			if (key.startsWith('_')) {
				continue;
			}

			// Include all other fields
			cleanedContent[key] = value;
		}

		return cleanedContent;
	}

	/**
	 * Process all stories with AI SEO updates
	 */
	async processBulkSeoUpdates(dryRun = false) {
		try {
			console.log(`
🚀 Starting bulk AI SEO updates...
Space ID: ${this.space_id}
Content type block: ${this.content_type_block}
AI SEO field name: ${this.ai_seo_field}
---\n`,
			);

			// Fetch all stories
			const stories = await this.fetchAllStories();

			if (stories.length === 0) {
				console.log(`Found no stories with ${this.content_type_block} content type block.`);
				return;
			}

			const results = {
				errors: [],
				failed: 0,
				skipped: 0,
				successful: 0,
				total: stories.length,
			};

			// Process each story
			for (let i = 0; i < stories.length; i++) {
				const story = stories[i];
				console.log(
					`\n[${i + 1}/${stories.length}] Processing story "${story.name}"`,
				);

				if (dryRun) {
					console.log(`🔍 DRY RUN. Not processing this story`);
					results.successful++;
					continue;
				}

				const result = await this.updateStorySeo(story);

				if (result.success) {
					results.successful++;
				} else {
					results.failed++;
					results.errors.push({
						error: result.error,
						id: story.id,
						story: story.name,
					});
				}

				// Add a delay of 1 second to avoid rate limiting
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Print summary
				console.log(`
---

\x1b[1mSUMMARY\x1b[0m
Total stories: ${results.total}
✔︎ Successful updates: ${results.successful}
⊖ Skipped (no SEO field): ${results.skipped}
X Failed updates: ${results.failed}`,
			);

			if (results.errors.length > 0) {
				console.log('\n❌ ERRORS:');
				results.errors.forEach((error) => {
					console.log(`- "${error.story}" (ID: ${error.id}): ${error.error}`);
				});
			}

			console.log(`\n🎉 Bulk update AI SEO completed!`);
		} catch (error) {
			console.error(
				`💥 Fatal error during the update: ${error.message}`,
			);
			throw error;
		}
	}
}
