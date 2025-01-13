import { IsEnum, IsMongoId, IsUUID } from 'class-validator';
import { OrderStatus } from 'src/enum';

export class OrderStatusUpdatedDto {
  @IsMongoId()
  orderId: string;

  @IsUUID()
  restaurantId: string;

  @IsEnum(OrderStatus, { message: 'Invalid status' })
  newStatus: OrderStatus;
}
