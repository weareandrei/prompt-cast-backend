import 'dotenv/config' // loads .env
import { AppService } from '../../src/app.service'
import { PodcastConfig } from '../../src/common/types/podcastConfig'

const test = async () => {
  const appService = new AppService()

  const payload: PodcastConfig = {
    id: '2f62ba0f-5383-460d-b05c-0936fc58e24f',
    voice: 'male',
    topic: 'History of Coffee',
    timeLimit: 5,
    narrativeStyle: 'casual storytelling',
  }

  const success = await appService.createPodcast(payload)

  console.log('Podcast script created successfully -', success)
}

test()
