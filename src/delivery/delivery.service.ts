import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { OrderInfoDto } from 'src/dto';
import { OrderStatus } from 'src/enum';
import { DeliveryGateway } from 'src/websocket/websocket.gateway';

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly websocket: DeliveryGateway,
  ) {}

  updateOrderStatus(
    orderId: string,
    restaurantId: string,
    newStatus: OrderStatus,
  ) {
    this.websocket.emitOrderChange(orderId, restaurantId, newStatus);
  }

  orderPaid(newOrder: any) {
    this.websocket.emitNewOrder(newOrder);
  }

  async orderReadyForDelivery(orderReadyForDelivery: OrderInfoDto) {
    this.websocket.emitOrderReadyForDelivery({
      id: orderReadyForDelivery.orderId,
      restaurantName: orderReadyForDelivery.restaurantName,
    });
  }
}
