import { IsNotEmpty, IsString } from 'class-validator';
export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  product_title: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  quantity: number;
}
