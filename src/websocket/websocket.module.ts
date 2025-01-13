import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { DeliveryGateway } from './websocket.gateway';

@Module({
  providers: [DeliveryGateway, WebsocketService],
  exports: [WebsocketService, DeliveryGateway],
})
export class DeliveryWebsocketModule {}
