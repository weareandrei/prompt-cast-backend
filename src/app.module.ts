import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes env variables available across the app
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
