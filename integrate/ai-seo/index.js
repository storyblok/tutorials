import bulkUpdateAiSeo from './bulk-update-ai-seo.js';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Helper function to get argument value
function getArgValue(argumentName) {
	const argument = args.find((a) => a.startsWith(`--${argumentName}=`));
	return argument ? argument.split('=')[1] : null;
}

// Configuration with environment variables and command line overrides
// biome-ignore assist/source/useSortedKeys: breaks the logic
const config = {
	token: process.env.SB_MANAGEMENT_API_TOKEN,
	space_id: getArgValue('space-id') || process.env.SB_SPACE_ID,
	content_type_block: getArgValue('content-type-block') || process.env.SB_CONTENT_TYPE_BLOCK,
	ai_seo_field: getArgValue('ai-seo-field') || process.env.SB_AI_SEO_FIELD,
	ai_api_url: process.env.AI_API_URL,
	ai_api_token: process.env.AI_API_TOKEN,
	custom_prompt:
		process.env.AI_CUSTOM_PROMPT ||
		`You are an SEO expert. Generate optimized SEO metadata based on the provided story content. Create compelling and accurate summary that will improve search engine visibility and click-through rates.`,
};

// Validation
const requiredFields = ['token', 'space_id', 'content_type_block', 'ai_seo_field'];
const missingFields = requiredFields.filter((field) => !config[field]);

if (missingFields.length > 0) {
	console.error(`Missing required configuration:`);
	missingFields.forEach((field) => {
		const envVar = `SB_${field.toUpperCase()}`;
		console.error(`- ${envVar}: ${field}`);
	});
	console.error(`\nSet the required environment variables.`);
	process.exit(1);
}

// Check AI configuration for non-dry runs
if (!dryRun && (!config.ai_api_url || !config.ai_api_token)) {
	console.error(`
AI API configuration is required for actual updates.
Configure the AI API URL and token in your environment variables.

TIP: use the --dry-run flag to test without making AI API calls.\n`);
	process.exit(1);
}

// Display configuration only dry runs
if (dryRun) {
	console.log(`
\x1b[1mCONFIGURATION\x1b[0m
Space ID: ${config.space_id}
Content type block: ${config.content_type_block}
AI SEO field name: ${config.ai_seo_field}
AI API URL: ${config.ai_api_url ? '✔︎ Configured' : 'Not configured'}
AI API token: ${config.ai_api_token ? '✔︎ Configured' : 'Not configured'}
Dry run: ${dryRun}
`);
}
// Confirmation prompt for non-dry runs
if (!dryRun) {
	console.log(
		`⚠️ WARNING: This will make actual changes to your Storyblok content. \nbackup your content before proceeding.\n`,
	);
}

try {
	// Create and run a bulk update
	const storyblok = new bulkUpdateAiSeo(config);
	await storyblok.processBulkSeoUpdates(dryRun);
} catch (error) {
	console.error(
		`💥 Script failed: ${error.message}\n Full error details:\n${error}`,
	);
	process.exit(1);
}
