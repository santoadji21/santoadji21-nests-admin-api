import { AbstractPaginationParams } from '@/common/types/pagination.type';
import { ApiResponse, PaginatedResponse } from '@/common/types/response.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

@Injectable()
export abstract class AbstractCrudService<
  T,
  CreateDtoType extends DeepPartial<T>,
  UpdateDtoType extends DeepPartial<T>,
  P extends FindManyOptions<T> = FindManyOptions<T>,
> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(createDto: CreateDtoType): Promise<ApiResponse<T>> {
    const entity = this.repository.create(createDto);
    const savedEntity = await this.repository.save(entity);
    return {
      success: true,
      message: `${this.entityName} created successfully`,
      data: savedEntity,
    };
  }

  async paginate(
    params: AbstractPaginationParams<T>,
    options: FindOneOptions<T> = {},
  ): Promise<PaginatedResponse<T[]>> {
    const {
      page,
      limit,
      baseUrl,
      orderBy = 'id',
      additionalOptions = {} as P,
    } = params;
    let order = 'ASC';
    let orderField = orderBy;

    if (orderBy?.startsWith('-')) {
      order = 'DESC';
      orderField = orderBy.substring(1);
    }
    const isStringKeyOfEntity = (prop: PropertyKey): prop is keyof T => {
      return (
        typeof prop === 'string' &&
        prop in this.repository.metadata.propertiesMap
      );
    };

    let orderOptions: FindOptionsOrder<T> | undefined;
    if (isStringKeyOfEntity(orderField)) {
      orderOptions = { [orderField]: order } as FindOptionsOrder<T>;
    }

    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: orderOptions,
      ...options,
      ...additionalOptions,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const buildPageUrl = (newPage: number) =>
      `${baseUrl}?page=${newPage}&limit=${limit}&orderBy=${orderBy}`;

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

  async findOne(
    id: number,
    options: FindOneOptions<T> = {},
  ): Promise<ApiResponse<T>> {
    const findOptions: FindOneOptions<T> = {
      ...options,
      where: { ...options.where, id } as FindOptionsWhere<T>,
    };
    const entity = await this.repository.findOne(findOptions);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return {
      success: true,
      message: `${this.entityName} found`,
      data: entity,
    };
  }

  async findByEmail(
    email: string,
    options: FindOneOptions<T> = {},
  ): Promise<ApiResponse<T>> {
    const findOptions: FindOneOptions<T> = {
      ...options,
      where: {
        ...options.where,
        email,
      } as FindOptionsWhere<T>,
    };
    const entity = await this.repository.findOne(findOptions);
    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} with email ${email} not found`,
      );
    }
    return {
      success: true,
      message: `${this.entityName} found`,
      data: entity,
    };
  }

  async update(id: number, updateDto: UpdateDtoType): Promise<ApiResponse<T>> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    Object.assign(entity, updateDto);
    const savedEntity = await this.repository.save(
      entity as DeepPartial<T> & T,
    );
    return {
      success: true,
      message: `${this.entityName} updated successfully`,
      data: savedEntity as T,
    };
  }

  async remove(id: number): Promise<void> {
    const existEntity = await this.findOne(id);
    if (!existEntity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    await this.repository.delete(id);
  }

  protected abstract get entityName(): string;
}
