import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WebsocketService {
  private readonly LOGGER = new Logger('DeliveryWebsocketService');

  private connectedClientsOrder: { [orderId: string]: Socket[] } = {};
  private connectedClientsRestaurant: { [restaurantId: string]: Socket[] } = {};
  private pendingEventsOrder: { [orderId: string]: any[] } = {};
  private pendingEventsRestaurant: { [restaurantId: string]: any[] } = {};

  addClientOrder(orderId: string, client: Socket): void {
    if (!this.connectedClientsOrder[orderId]) {
      this.connectedClientsOrder[orderId] = [];
    }
    this.connectedClientsOrder[orderId].push(client);
    this.LOGGER.log(`Client added to room: ${orderId}`);
  }
  addClientRestaurant(restaurantId: string, client: Socket): void {
    if (!this.connectedClientsRestaurant[restaurantId]) {
      this.connectedClientsRestaurant[restaurantId] = [];
    }
    this.connectedClientsRestaurant[restaurantId].push(client);
    this.LOGGER.log(`Client added to room: ${restaurantId}`);
  }

  removeClientOrder(orderId: string, clientId: string): void {
    if (this.connectedClientsOrder[orderId]) {
      this.connectedClientsOrder[orderId] = this.connectedClientsOrder[
        orderId
      ].filter((socket) => socket.id !== clientId);
      if (this.connectedClientsOrder[orderId].length === 0) {
        delete this.connectedClientsOrder[orderId];
      }
      this.LOGGER.log(`Client removed from room: ${orderId}`);
    }
  }
  removeClientRestaurant(restaurantId: string, clientId: string): void {
    if (this.connectedClientsRestaurant[restaurantId]) {
      this.connectedClientsRestaurant[restaurantId] =
        this.connectedClientsRestaurant[restaurantId].filter(
          (socket) => socket.id !== clientId,
        );
      if (this.connectedClientsRestaurant[restaurantId].length === 0) {
        delete this.connectedClientsRestaurant[restaurantId];
      }
      this.LOGGER.log(`Client removed from room: ${restaurantId}`);
    }
  }

  emitOrderEvent(orderId: string, eventName: string, payload: any): void {
    const clients = this.connectedClientsOrder[orderId];
    if (clients && clients.length > 0) {
      clients.forEach((socket) => {
        socket.emit(eventName, payload);
      });
      this.LOGGER.log(`Event '${eventName}' emitted to orderId: ${orderId}`);
    } else {
      this.pendingEventsOrder[orderId] = this.pendingEventsOrder[orderId] || [];
      this.pendingEventsOrder[orderId].push({ eventName, payload });
      this.LOGGER.log(
        `No clients connected for orderId: ${orderId}, event '${eventName}' pending`,
      );
    }
  }
  emitRestaurantEvent(
    restaurantId: string,
    eventName: string,
    payload: any,
  ): void {
    this.LOGGER.log('Array of clients connected for restaurant');
    const clients = this.connectedClientsRestaurant[restaurantId];
    if (clients && clients.length > 0) {
      clients.forEach((socket) => {
        socket.emit(eventName, payload);
      });
      this.LOGGER.log(
        `Event '${eventName}' emitted to restaurantId: ${restaurantId}`,
      );
    } else {
      this.pendingEventsRestaurant[restaurantId] =
        this.pendingEventsRestaurant[restaurantId] || [];
      this.pendingEventsRestaurant[restaurantId].push({ eventName, payload });
      this.LOGGER.log(
        `No clients connected for restaurantId: ${restaurantId}, event '${eventName}' pending`,
      );
    }
  }

  emitPendingEventsOrder(orderId: string, client: Socket): void {
    const events = this.pendingEventsOrder[orderId];
    if (events && events.length > 0) {
      events.forEach((event) => {
        client.emit(event.eventName, event.payload);
        this.LOGGER.log(
          `Emitting pending event '${event.eventName}' for orderId: ${orderId}`,
        );
      });
      delete this.pendingEventsOrder[orderId];
    }
  }

  emitPendingEventsRestaurant(orderId: string, client: Socket): void {
    const events = this.pendingEventsRestaurant[orderId];
    if (events && events.length > 0) {
      events.forEach((event) => {
        client.emit(event.eventName, event.payload);
        this.LOGGER.log(
          `Emitting pending event '${event.eventName}' for orderId: ${orderId}`,
        );
      });
      delete this.pendingEventsRestaurant[orderId];
    }
  }
}
