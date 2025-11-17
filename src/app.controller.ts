import { Body, Controller, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { type PodcastConfig } from './common/types/podcastConfig'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('create-podcast')
  createPodcast(@Body() payload: PodcastConfig): Promise<void> {
    return this.appService.createPodcast(payload)
  }
}
