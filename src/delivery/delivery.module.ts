import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { NatsModule } from 'src/transports/nats.module';
import { DeliveryWebsocketModule } from 'src/websocket/websocket.module';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService],
  imports: [NatsModule, DeliveryWebsocketModule],
})
export class DeliveryModule {}
