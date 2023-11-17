import { CreateProductDto, UpdateProductDto } from '@/apps/products/dto';
import { Product } from '@/apps/products/entities/product.entity';
import { UsersService } from '@/apps/users/users.service';
import { AbstractCrudService } from '@/common/services/abstract.crud.service';
import { AbstractPaginationParams } from '@/common/types/pagination.type';
import { ApiResponse, PaginatedResponse } from '@/common/types/response.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class ProductsService extends AbstractCrudService<
  Product,
  CreateProductDto,
  UpdateProductDto,
  FindManyOptions<Product>
> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UsersService,
  ) {
    super(productRepository);
  }
  protected get entityName(): string {
    return 'Product';
  }
  async createProduct(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<ApiResponse<Product>> {
    if (!userId) {
      throw new NotFoundException('Invalid user');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const product = this.productRepository.create({
      ...createProductDto,
      user: user.data,
    });

    const savedProduct = await this.productRepository.save(product);
    return {
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    };
  }

  async paginate(
    params: AbstractPaginationParams<Product>,
  ): Promise<PaginatedResponse<Product[]>> {
    return super.paginate(params, {
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<ApiResponse<Product>> {
    const product = await super.findOne(id, {
      relations: ['user'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    const product = await super.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const updatedProduct = await this.productRepository.save({
      ...product.data,
      ...updateProductDto,
    });
    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }
}
