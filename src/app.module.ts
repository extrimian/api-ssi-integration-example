import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { AppService } from './app.service';
import { ApiSSIService } from './services/api-ssi.service';
import { IssuerController } from './api-ssi.controller';

@Module({
  imports: [],
  controllers: [
    WebhookController,
    IssuerController
  ],
  providers: [
    AppService,
    ApiSSIService
  ],
})
export class AppModule { }
