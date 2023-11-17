import { MinioClientService } from '@/apps/minio-client/minio-client.service';
import { CreateProductDto, UpdateProductDto } from '@/apps/products/dto';
import { Product } from '@/apps/products/entities/product.entity';
import { UsersService } from '@/apps/users/users.service';
import { AbstractCrudService } from '@/common/services/abstract.crud.service';
import { BufferedFile } from '@/common/types/buffer';
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
    private readonly minioClientService: MinioClientService,
  ) {
    super(productRepository);
  }
  protected get entityName(): string {
    return 'Product';
  }
  async createProduct(
    createProductDto: CreateProductDto,
    userId: number,
    image: BufferedFile,
  ): Promise<ApiResponse<Product>> {
    if (!userId) {
      throw new NotFoundException('Invalid user');
    }
    const imageUpload = await this.minioClientService.upload(image);

    const product = this.productRepository.create({
      ...createProductDto,
      image: imageUpload.url,
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
    return super.paginate(params);
  }

  async findOne(id: number): Promise<ApiResponse<Product>> {
    const product = await super.findOne(id);
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

  async delete(id: number): Promise<ApiResponse<Product>> {
    const product = await super.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.delete(id);
    return {
      success: true,
      message: 'Product deleted successfully',
      data: product.data,
    };
  }
}
