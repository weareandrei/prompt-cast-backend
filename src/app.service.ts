import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }

  createPodcast(data: { title: string; description?: string }): boolean {
    console.log('Saving podcast:', data)
    // Save to DB, queue jobs, etc.
    return true
  }
}
