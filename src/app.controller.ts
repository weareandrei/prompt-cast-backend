import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { type PodcastConfig } from './common/types/podcastConfig'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Post('create-podcast')
  createPodcast(@Body() payload: PodcastConfig): Promise<boolean> {
    return this.appService.createPodcast(payload)
  }
}
