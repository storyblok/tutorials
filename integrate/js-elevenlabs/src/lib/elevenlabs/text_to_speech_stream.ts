import { ElevenLabsClient } from "elevenlabs"

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY in environment variables.")
}

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})

export const createAudioStreamFromText = async (
  text: string
): Promise<Buffer | undefined> => {
  try {
    const audioStream = await client.generate({
      voice: "Rachel",
      model_id: "eleven_turbo_v2",
      text,
    })

    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }

    const content = Buffer.concat(chunks)
    return content
  } catch (err) {
    return
  }
}
