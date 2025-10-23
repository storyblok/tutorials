import { createAudioStreamFromText } from "~/lib/elevenlabs"
import { getStoryContent, uploadAsset } from "~/lib/storyblok"

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 200 })
  }
  if (req.method !== "POST") {
    return new Response("", { status: 405 })
  }

  const body = await req.json()
  const content = await getStoryContent(body.space_id, body.story_id)
  if (!content) {
    return Response.json(
      { message: "The entry content is empty." },
      { status: 500 }
    )
  }

  const audioBuffer = await createAudioStreamFromText(content.slice(0, 100))
  if (!audioBuffer) {
    return Response.json(
      { message: "Error while generating the audio." },
      { status: 500 }
    )
  }

  const uploadAssetRes = await uploadAsset(
    audioBuffer,
    body.space_id,
    body.story_id
  )

  return uploadAssetRes
    ? Response.json(
        { message: "Text-to-Speech successfully created and uploaded." },
        { status: 200 }
      )
    : Response.json({ message: "Something went wrong." }, { status: 500 })
}
