import { Body, Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';

@Controller("webhook")
export class WebhookController {
  constructor(private readonly appService: AppService) { }

  @Put()
  webhookEndpoint(@Body() param: { eventType: string, eventData: any }): void {
    if (param.eventType == "presentation-request") {
      axios.put(`https://sandbox-ssi.extrimian.com/v1/credentialsbbs/waci/oob/presentation-proceed`, {
        invitationId: param.eventData.invitationId,
        verifiableCredentials: [param.eventData.credentialsToPresent[0].data]
      });
    }

    console.log("EVENTO NOTIFICADO DE LA API: ", param.eventType, JSON.stringify(param.eventData));
  }
}
