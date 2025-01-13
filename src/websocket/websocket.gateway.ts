import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OrderStatus } from 'src/enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DeliveryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly LOGGER = new Logger('DeliveryWebsocketGateway');

  constructor(private readonly websocketService: WebsocketService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const { orderId, restaurantId, courier } = client.handshake.query;
    const orderIdStr = orderId as string;
    const restaurantIdStr = restaurantId as string;
    if (!orderIdStr && !restaurantIdStr && !courier) {
      client.disconnect();
      return;
    }

    if (orderIdStr) {
      client.join(orderIdStr);
      this.websocketService.addClientOrder(orderIdStr, client);
      this.LOGGER.log(`Client connected to room: ${orderIdStr}`);
      this.websocketService.emitPendingEventsOrder(orderIdStr, client);
    }

    if (restaurantIdStr) {
      client.join(restaurantIdStr);
      this.websocketService.addClientRestaurant(restaurantIdStr, client);
      this.LOGGER.log(`Client connected to room: ${restaurantIdStr}`);
    }

    if (courier) {
      client.join('courierRoom');
      this.LOGGER.log(`Client connected to couriers room.`);
    }
  }
  handleDisconnect(client: Socket) {
    const { orderId, restaurantId, courier } = client.handshake.query;
    const orderIdStr = orderId as string;
    const restaurantIdStr = restaurantId as string;

    // Si el cliente estaba en una sala de orderId, removerlo de esa sala
    if (orderIdStr) {
      this.websocketService.removeClientOrder(orderIdStr, client.id);
      client.leave(orderIdStr);
      this.LOGGER.log(`Client disconnected from order room: ${orderIdStr}`);
    }

    // Si el cliente estaba en una sala de restaurantId, removerlo de esa sala
    if (restaurantIdStr) {
      this.websocketService.removeClientRestaurant(restaurantIdStr, client.id);
      client.leave(restaurantIdStr);
      this.LOGGER.log(
        `Client disconnected from restaurant room: ${restaurantIdStr}`,
      );
    }

    if (courier) {
      client.leave('courierRoom');
      this.LOGGER.log(`Client disconnected from courier room.`);
    }

    this.LOGGER.log(`Client disconnected: ${client.id}`);
  }

  emitOrderChange(
    orderId: string,
    restaurantId: string,
    newStatus: OrderStatus,
  ) {
    this.websocketService.emitOrderEvent(orderId, 'order_status_change', {
      orderId,
      newStatus,
    });
    this.websocketService.emitRestaurantEvent(
      restaurantId,
      'order_status_change',
      {
        orderId,
        restaurantId,
        newStatus,
      },
    );
  }

  emitNewOrder(newOrder: any) {
    this.websocketService.emitRestaurantEvent(
      newOrder.restaurantId,
      'order_created',
      newOrder,
    );
  }

  emitOrderReadyForDelivery(orderData: { id: string; restaurantName: string }) {
    this.server.emit('order_ready_for_delivery', orderData);
  }

  @SubscribeMessage('accept_delivery')
  handleCourierResponse(@MessageBody() data: any) {
    this.LOGGER.log('Courier response received:', data);
  }
}
