import { CreateOrderDto, UpdateOrderDto } from '@/apps/orders/dto';
import { OrdersService } from '@/apps/orders/orders.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  Query,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import * as csv from 'csv';
import { Request, Response } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private formateDate(date: Date): string {
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  async findAll(
    @Req() request: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('order') orderBy = 'order_date',
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const paginationParams = {
      page,
      limit,
      orderBy,
      baseUrl: baseUrl,
    };
    return this.ordersService.paginate(paginationParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Post('charts')
  async chartOrder() {
    return await this.ordersService.chartOrder();
  }

  @Post('export')
  @UseInterceptors(ClassSerializerInterceptor)
  async export(@Res() response: Response) {
    const orders = await this.ordersService.findAll();

    if (orders.data.length === 0) {
      throw new NotFoundException('No orders found');
    }
    function getObjectKeys(obj: any): string[] {
      return Object.keys(obj);
    }
    const columns = getObjectKeys(orders.data[0]).map((key) => ({
      key,
      header: key.replace(/_/g, ' ').toUpperCase(),
    }));
    const transformedOrders = orders.data.map((order) => {
      const orderItemsString = order.order_items
        .map(
          (item) =>
            `${item.product_title} (Qty: ${item.quantity}, Price: ${item.price})`,
        )
        .join('; ');

      return {
        ...order,
        order_date: this.formateDate(order.order_date),
        order_items: orderItemsString || 'No items',
      };
    });
    response.header('Content-Type', 'text/csv');
    response.header('Content-Disposition', 'attachment; filename=export.csv');

    csv
      .stringify(transformedOrders, {
        header: true,
        columns: columns,
      })
      .pipe(response);

    return {
      success: true,
      message: 'Orders exported successfully',
      data: null,
    };
  }
}
