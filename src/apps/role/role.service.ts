import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from '@/apps/role/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@/apps/role/entities/role.entity';
import { Repository } from 'typeorm';
import { ApiResponse, PaginatedResponse } from '@/common/types/response.type';
import { UsersPaginationParams } from '@/apps/users/types/user.types';
import { PermissionService } from '@/apps/permission/permission.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionService: PermissionService,
  ) {}

  async create(
    createRoleDto: Omit<CreateRoleDto, 'permission'>,
  ): Promise<ApiResponse<Role> | undefined> {
    const role = this.roleRepository.create(createRoleDto);
    const existingRoleName = this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    const existingRoleId = this.roleRepository.findOne({
      where: { id: createRoleDto.id },
    });
    if (existingRoleName || existingRoleId) {
      throw new ConflictException('Role already exists');
    }
    await this.roleRepository.save(role);
    return {
      success: true,
      message: 'Role created successfully',
      data: role,
    };
  }

  async paginate(
    params: UsersPaginationParams,
  ): Promise<PaginatedResponse<Role[]>> {
    const { page, baseUrl, limit, orderBy } = params;
    let order = 'ASC'; // Default order
    let orderField = orderBy;

    if (orderBy?.startsWith('-')) {
      order = 'DESC';
      orderField = orderBy?.substring(1);
    }

    const [data, total] = await this.roleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderField]: order,
      },
      relations: ['permissions'],
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

  async findOne(id: number): Promise<ApiResponse<Role> | undefined> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return {
      success: true,
      message: 'Role retrieved successfully',
      data: role,
    };
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponse<Role>> {
    const { data } = await this.findOne(id);
    if (!data) {
      throw new NotFoundException('Role not found');
    }
    const existingRoleName = await this.roleRepository.findOne({
      where: { name: updateRoleDto.name },
    });
    const existingRoleId = await this.roleRepository.findOne({
      where: { id: updateRoleDto.id },
    });
    if (!existingRoleName || !existingRoleId) {
      throw new ConflictException('Role not found');
    }
    // data.name = updateRoleDto.name ?? data.name;

    // if (updateRoleDto.permission) {
    //   data.permissions = await this.permissionService.findByIds(
    //     updateRoleDto.permission,
    //   );
    // }
    const updated = Object.assign(data, updateRoleDto);
    const updatedRole = await this.roleRepository.save(updated);

    return {
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    };
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.delete(id);
  }
}
