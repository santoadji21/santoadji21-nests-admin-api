import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@/apps/permission/dto';
import { Permission } from '@/apps/permission/entities/permission.entity';
import { PaginationParams } from '@/common/types/pagination.type';
import { ApiResponse, PaginatedResponse } from '@/common/types/response.type';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<ApiResponse<Permission> | undefined> {
    const permission =
      await this.permissionRepository.create(createPermissionDto);
    const existingPermissionName = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });
    const existingPermissionId = await this.permissionRepository.findOne({
      where: { id: createPermissionDto.id },
    });
    if (existingPermissionName || existingPermissionId) {
      throw new ConflictException('Permission already exists');
    }
    await this.permissionRepository.save(permission);
    return {
      success: true,
      message: 'Permission created successfully',
      data: permission,
    };
  }

  async paginate(
    params: PaginationParams,
  ): Promise<PaginatedResponse<Permission[]>> {
    const { page, baseUrl, limit, orderBy } = params;

    let order = 'ASC'; // Default order
    let orderField = orderBy;

    if (orderBy?.startsWith('-')) {
      order = 'DESC';
      orderField = orderBy?.substring(1);
    }

    const [data, total] = await this.permissionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderField]: order,
      },
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

  async findOne(id: number) {
    return this.permissionRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new ConflictException('Permission not found');
    }
    return this.permissionRepository.update(id, updatePermissionDto);
  }

  async findByIds(ids: number[]) {
    return this.permissionRepository.findBy({
      id: In(ids),
    });
  }

  async remove(id: number) {
    return this.permissionRepository.delete(id);
  }
}
