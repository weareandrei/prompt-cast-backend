import { Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import { PodcastConfig } from './common/types/podcastConfig'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }

  async createPodcast(payload: PodcastConfig): Promise<boolean> {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `Write a script for podcast. I will read it aloud, so make sure it sounds good and interesting. This is not a boring academic research paper. This it informative and both entertaining.
- Topic: ${payload.topic}
- Approximate reading time: ${payload.timeLimit} minutes.
- Storytelling style: ${payload.narrativeStyle}

How to deliver:
Break your response down into sections. I will say "Continue" and you should send me the next chunk. If you've sent me everything till the end, then when I say "Continue"  you should reply "End". Nothing else. Let's be professional and focus on this task. No chatting. No goign back and forth. No explanation of what you did. No headers. Just pure text script for the podcast. 

Don't make any annotations. Don't mentions anything like "background music", or "make a pause here", or "How humans developed from monkeys long ago" in the beginning of your response. Don't say "Continue" in the end of each response. Only script with text that I will read, nothing else. First and last word of your response should be only the script and nothing else.`,
          },
        ],
        temperature: 1,
        max_tokens: 3000,
        top_p: 1,
      })

      console.log(
        'Generated podcast script chunk:',
        response.choices[0].message.content
      )

      return true
    } catch (error) {
      console.error('OpenAI error:', error)
      return false
    }
  }
}
