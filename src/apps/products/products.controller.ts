import { Request } from 'express';
import { GetUserId } from '@/common/decorators/get.user.id.decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUserId() userId: number,
  ) {
    return this.productsService.createProduct(createProductDto, userId);
  }

  @Get()
  async findAll(
    @Req() request: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('order') orderBy = 'name',
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const paginationParams = {
      page,
      limit,
      orderBy,
      baseUrl: baseUrl,
    };
    return this.productsService.paginate(paginationParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
