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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { BufferedFile } from '@/common/types/buffer';
import { CreateProductDto, UpdateProductDto } from '@/apps/products/dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body('data') dataString: string,
    @GetUserId() userId: number,
    @UploadedFile() image: BufferedFile,
  ) {
    const createProductDto: CreateProductDto = JSON.parse(dataString);
    return this.productsService.createProduct(createProductDto, userId, image);
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
