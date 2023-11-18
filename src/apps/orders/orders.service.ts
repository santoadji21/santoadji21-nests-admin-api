import { CreateOrderDto, UpdateOrderDto } from '@/apps/orders/dto';
import { CreateOrderItemDto } from '@/apps/orders/dto/create-order-item.dto';
import { OrderItem } from '@/apps/orders/entities/order-item';
import { Order } from '@/apps/orders/entities/order.entity';
import { PaginationParams } from '@/common/types/pagination.type';
import { ApiResponse, PaginatedResponse } from '@/common/types/response.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  private createOrderItemEntity(
    itemDto: CreateOrderItemDto,
    order: Order,
  ): OrderItem {
    const orderItem = new OrderItem();
    orderItem.product_title = itemDto.product_title;
    orderItem.price = itemDto.price;
    orderItem.quantity = itemDto.quantity;
    orderItem.order = order;
    return orderItem;
  }

  async create(createOrderDto: CreateOrderDto): Promise<ApiResponse<Order>> {
    // Check for existing order
    let order = await this.findOrderByEmail(createOrderDto.email);

    if (order) {
      // Existing order found, add new items to it
      const newItems = createOrderDto.order_items.map((itemDto) =>
        this.createOrderItemEntity(itemDto, order),
      );
      order.order_items.push(...newItems);
    } else {
      // No existing order, create a new one
      order = this.ordersRepository.create(createOrderDto);
    }
    // Associate saved order with each order item and save them
    const savedOrder = await this.ordersRepository.save(order);
    order.order_items.forEach((item) => (item.order = savedOrder));
    await Promise.all(
      order.order_items.map((item) => this.orderItemRepository.save(item)),
    );
    // Save the order (new or updated)
    return {
      success: true,
      message: 'Order created successfully',
      data: savedOrder,
    };
  }

  async findAll(): Promise<ApiResponse<Order[]>> {
    const orders = await this.ordersRepository.find({
      order: {
        order_date: 'DESC',
      },
      relations: ['order_items'],
    });
    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    };
  }

  async paginate(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Order[]>> {
    const { page, baseUrl, limit, orderBy } = params;
    let order = 'ASC'; // Default order
    let orderField = orderBy;

    if (orderBy?.startsWith('-')) {
      order = 'DESC';
      orderField = orderBy?.substring(1);
    }

    const [data, total] = await this.ordersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderField]: order,
      },
      relations: ['order_items'],
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const buildPageUrl = (newPage: number) =>
      `${baseUrl}/users?page=${newPage}&limit=${limit}&orderBy=${orderBy}`;

    return {
      success: true,
      data: data,
      pagination: {
        totalItems: total,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        next: hasNextPage ? buildPageUrl(page + 1) : null,
        prev: hasPreviousPage ? buildPageUrl(page - 1) : null,
      },
    };
  }

  async findOne(id: number): Promise<ApiResponse<Order> | undefined> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['order_items'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ApiResponse<Order>> {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const updated = Object.assign(order, updateOrderDto);
    const updatedOrder = await this.ordersRepository.save(updated);
    return {
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    };
  }

  async remove(id: number): Promise<ApiResponse<Order>> {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    await this.ordersRepository.delete(id);
    return {
      success: true,
      message: 'Order deleted successfully',
      data: null,
    };
  }

  async findOrderByEmail(email: string): Promise<Order | undefined> {
    return this.ordersRepository.findOne({
      where: { email: email },
      relations: ['order_items'], // Ensure to load the order items as well
    });
  }

  async chartOrder(): Promise<unknown> {
    const chart = await this.ordersRepository.query(`
  SELECT to_char(orders.order_date, 'YYYY-MM-DD') AS date,
         SUM(COALESCE(order_items.price, 0) * COALESCE(order_items.quantity, 0)) AS sum
  FROM orders
  JOIN order_items ON orders.id = order_items.order_id
  GROUP BY to_char(orders.order_date, 'YYYY-MM-DD');
      `);
    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: chart,
    };
  }
}
