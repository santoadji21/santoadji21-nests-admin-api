import { OrderItem } from '@/apps/orders/entities/order-item';
import { Exclude, Expose, instanceToPlain } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  order_date: Date;

  @Column()
  @Exclude()
  first_name: string;

  @Column()
  @Exclude()
  last_name: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  order_items: OrderItem[];

  @Column()
  status: string;

  @Expose()
  get name(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  @Expose()
  get total(): number {
    return this.order_items.reduce((sum, item) => sum + item.quantity, 0);
  }

  @Expose()
  get total_price(): number {
    return this.order_items.reduce((sum, item) => {
      const itemPrice = isNaN(item.price) ? 0 : item.price;
      const itemQuantity = isNaN(item.quantity) ? 0 : item.quantity;
      return sum + itemPrice * itemQuantity;
    }, 0);
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
