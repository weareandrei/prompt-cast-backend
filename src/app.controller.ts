import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Post('creat-podcast')
  createPodcast(
    @Body() payload: { title: string; description?: string }
  ): boolean {
    return this.appService.createPodcast(payload)
  }
}
