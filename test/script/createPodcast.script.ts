import 'dotenv/config' // loads .env
import { AppService } from '../../src/app.service'
import { PodcastConfig } from '../../src/common/types/podcastConfig'

const test = async () => {
  const appService = new AppService()

  const payload: PodcastConfig = {
    id: '6',
    voice: 'male',
    topic: 'History of Coffee',
    timeLimit: 1,
    narrativeStyle: 'casual storytelling',
  }

  const success = await appService.createPodcast(payload)

  console.log('Podcast script created successfully -', success)
}

// const test = async () => {
//   const appService = new AppService()
//
//   const script =
//     'Imagine stepping back in time, to a land of golden sands, towering pyramids, and the mighty Nile River. Now, picture a bustling ancient economy thriving here, over 3,000 years ago, in the civilization of ancient Egypt. How did they manage it? It’s a fascinating story, and today, we’re diving right into how the economy evolved back then.\n'
//
//   const success = await appService.generateAudioAndUpload(script, 'test12345')
//
//   console.log('Podcast script created successfully -', success)
// }

test()
