import { Controller } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderInfoDto, OrderStatusUpdatedDto } from 'src/dto';
import { OrderStatus } from 'src/enum';

/**
 * Controller for handling delivery-related events.
 */
@Controller('delivery')
export class DeliveryController {
  /**
   * Constructs a new DeliveryController.
   * @param deliveryService - The delivery service to be used by the controller.
   */
  constructor(private readonly deliveryService: DeliveryService) {}

  /**
   * Handles the 'order_status_updated' event.
   * @param orderStatusUpdatedDto - The data transfer object containing the updated order status information.
   * @returns The result of the delivery service's updateOrderStatus method.
   */
  @EventPattern('order_status_updated')
  orderStatusUpdated(@Payload() orderStatusUpdatedDto: OrderStatusUpdatedDto) {
    const { orderId, restaurantId, newStatus } = orderStatusUpdatedDto;
    return this.deliveryService.updateOrderStatus(
      orderId,
      restaurantId,
      newStatus,
    );
  }

  /**
   * Handles the 'order_paid' event.
   * @param newOrder - The new order that has been paid.
   * @returns The result of the delivery service's orderPaid method.
   */
  @EventPattern('order_paid')
  orderPaid(@Payload() newOrder) {
    return this.deliveryService.orderPaid(newOrder);
  }

  /**
   * Handles the 'order_ready_for_delivery' event.
   * @param orderReadyForDelivery - The order that is ready for delivery.
   * @returns The result of the delivery service's orderReadyForDelivery method.
   */
  @EventPattern('order_ready_for_delivery')
  orderReadyForDelivery(@Payload() orderReadyForDelivery) {
    return this.deliveryService.orderReadyForDelivery(orderReadyForDelivery);
  }

  @EventPattern('order_delivered')
  orderDelivered(@Payload() orderDelivered) {
    const { orderId, restaurantId } = orderDelivered;
    return this.deliveryService.updateOrderStatus(
      orderId,
      restaurantId,
      OrderStatus.DELIVERED,
    );
  }
}
