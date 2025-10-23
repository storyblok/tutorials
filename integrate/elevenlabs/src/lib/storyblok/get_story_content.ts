import * as cheerio from "cheerio"
import Storyblok from "./client"

const titleSelector = "h1"
const bodySelector = "[data-blog-content]"

const getStoryUrl = async (
  spaceId: number,
  storyId: number
): Promise<string> => {
  try {
    const res = await Storyblok.get(`/spaces/${spaceId}/stories/${storyId}`)
    return res.data.story.full_slug
  } catch (err) {
    console.log(err)
    return ""
  }
}

if (!process.env.PRODUCTION_DOMAIN) {
  throw new Error("Missing PRODUCTION_DOMAIN in environment variables.")
}

export const getStoryContent = async (
  spaceId: number,
  storyId: number
): Promise<string> => {
  try {
    const domain = process.env.PRODUCTION_DOMAIN
    const url = await getStoryUrl(spaceId, storyId)
    const urlToCrawl = `${domain}${url}?ts=${Date.now()}`
    const res = await fetch(urlToCrawl)
    const urlText = await res.text()
    const cheerioDocument = cheerio.load(urlText)
    return `Article title: ${cheerioDocument(titleSelector).text()}. <break time="1.0s" /> Article content: ${cheerioDocument(bodySelector).text()}`
  } catch (err) {
    console.log(err)
    return ""
  }
}
