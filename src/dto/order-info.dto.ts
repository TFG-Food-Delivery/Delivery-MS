import {
  IsUUID,
  ValidateNested,
  IsArray,
  IsString,
  IsNumber,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsUUID()
  id: string;

  @IsUUID()
  dishId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  price: number;

  @IsMongoId()
  orderId: string;
}

export class OrderInfoDto {
  @IsMongoId()
  orderId: string;

  @IsUUID()
  restaurantId: string;

  @IsString()
  restaurantName: string;

  @IsUUID()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  totalAmount: number;
}
