import slugify from "slugify";

export function generateSlugFromName(name) {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}
