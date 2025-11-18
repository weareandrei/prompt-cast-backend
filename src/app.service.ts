import { Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import { PodcastConfig } from './common/types/podcastConfig'
import { post } from './common/util/api'
import { createClient } from '@supabase/supabase-js'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import * as hash from 'object-hash'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

@Injectable()
export class AppService {
  async createPodcast(payload: PodcastConfig) {
    console.log(
      `[createPodcast] Starting podcast generation for id: ${payload.id}`
    )

    try {
      const script = await this.generateScript(payload)

      await this.updatePodcastStatus(payload.id, 'script-generated', script)

      await this.generateAudioAndUpload(script, payload.id)
    } catch (error) {
      console.error(`[createPodcast] Error:`, error)
      throw error
    }
  }

  private async generateScript(payload: PodcastConfig): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `Write a script for podcast. I will read it aloud, so make sure it sounds good and interesting. This is not a boring academic research paper. This is informative and entertaining.
            - Topic: ${payload.topic}
            - Approximate reading time: ${payload.timeLimit} minutes.
            - Storytelling style: ${payload.narrativeStyle}
            
            How to deliver:
            Break your response down into sections. I will say "Continue" and you should send me the next chunk. If you've sent me everything till the end, then when I say "Continue"  you should reply "End". Nothing else. Let's be professional and focus on this task. No chatting. No going back and forth. No explanation of what you did. No headers. Just pure text script for the podcast.
            
            Don't make any annotations. Don't mention anything like "background music", or "make a pause here". Only script with text that I will read, nothing else. First and last word of your response should be only the script and nothing else.`,
        },
      ],
      temperature: 1,
      max_tokens: 3000,
      top_p: 1,
    })

    const script = response.choices[0]?.message?.content?.trim()

    if (!script) {
      throw new Error('Failed to generate podcast script. Script is empty.')
    }

    console.log(
      `[generateScript] Script generated for podcastId: ${payload.id}`
    )
    return script
  }

  private async updatePodcastStatus(
    podcastId: string,
    status: string,
    script?: string,
    fileUrl?: string
  ) {
    // eslint-disable-next-line
    const response = await post(
      'update-podcast-status',
      { podcastId, status, script, fileUrl },
      { token: process.env.SUPABASE_SERVICE_ROLE }
    )

    console.log(
      `[updatePodcastStatus] Status updated to "${status}" for podcastId: ${podcastId}`,
      response
    )
  }

  async generateAudioAndUpload(script: string, podcastId: string) {
    console.log(`[generateAudioAndUpload] Starting for podcastId: ${podcastId}`)

    const voiceId = 'JBFqnCBsd6RMkjVDRZzb' // Rachel
    // eslint-disable-next-line
    const requestHash = hash.MD5({ script, voiceId })
    const fileName = `audio/${requestHash}.mp3`

    const existingAudio = await this.checkCachedAudio(fileName)
    if (existingAudio) {
      console.log(
        `[generateAudioAndUpload] Using cached audio for podcastId: ${podcastId}`
      )
      return
    }

    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    })

    const audioResponse = await client.textToSpeech.stream(voiceId, {
      outputFormat: 'mp3_44100_128',
      text: script,
      modelId: 'eleven_multilingual_v2',
    })

    const chunks: Uint8Array[] = []
    for await (const chunk of audioResponse) {
      chunks.push(chunk)
    }

    const audioBuffer = Buffer.concat(chunks)

    console.log(
      `[generateAudioAndUpload] Uploading audio to Supabase: ${fileName}`
    )

    const { error } = await supabase.storage
      .from('podcasts')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (error) {
      console.error(`[generateAudioAndUpload] Upload error:`, error)
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    await supabase
      .from('podcasts')
      .update({
        audio_url: fileName,
      })
      .eq('id', podcastId)

    // const { data } = supabase.storage.from('podcasts').getPublicUrl(fileName)
    //
    // if (!data.publicUrl) {
    //   throw new Error('Failed to get public URL for uploaded audio file')
    // }

    console.log(
      `[generateAudioAndUpload] Audio uploaded. File name: ${fileName}`
    )

    await this.updatePodcastStatus(podcastId, 'completed', undefined, fileName)
  }

  private async checkCachedAudio(fileName: string): Promise<boolean> {
    const { data } = await supabase.storage
      .from('audio')
      .createSignedUrl(fileName, 60)
    if (!data) return false

    const res = await fetch(data.signedUrl)
    return res.ok
  }
}

// https://fjgsyvkwaxumcalmhgto.supabase.co/storage/v1/object/sign/podcasts/audio/7f2e34dc183633d52a98adc98cc20038.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFmMmUxNWYwLTZjNzUtNDA1Ni1hOGY1LWU4MzdlNGVhMDljMiJ9.eyJ1cmwiOiJwb2RjYXN0cy9hdWRpby83ZjJlMzRkYzE4MzYzM2Q1MmE5OGFkYzk4Y2MyMDAzOC5tcDMiLCJpYXQiOjE3NDg0NDQxMDAsImV4cCI6MTc0OTA0ODkwMH0.8N9oFFRBu5cFxPFfp5RD0_FlTY88pxm6viDjHn3MBPk
// https://fjgsyvkwaxumcalmhgto.supabase.co/storage/v1/object/public/podcasts/audio/7f2e34dc183633d52a98adc98cc20038.mp3
