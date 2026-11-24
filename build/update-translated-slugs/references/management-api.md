# Add or update a translated slug with the Management API

To add or update a translated slug with the Management API, include a `translated_slugs_attributes` array in the request payload when you update a story. Each object in the array contains the following fields:
- `lang`: The language code for the translated slug (for example, `fr` for French).
- `slug`: The translated slug for the story in the specified language.
- `name`: The translated name for the story in the specified language.
- `id`: Only when updating. The ID of the existing translated slug, from the `translated_slugs` array of the story object.

`update-translated-slugs.js` handles this for you. For each story, it fetches the story and checks `translated_slugs` for an entry with the same `lang`. If one exists, it updates that translated slug using its `id`. If not, it adds a new one. You do not need to look up translated slug IDs.

If the fetched story has `is_startpage: true`, the script leaves `slug` out of the payload and sends only `lang`, `name`, and `id` (when updating). This adds or updates the translated name and leaves the slug as it is. The API response decides whether a story is a root story, not the translations file.
