import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ApiResponse, PaginatedResponse } from '@/common/types/response.type';
import { User } from '@/apps/users/entities/user.entity';
import { CreateUserDto } from '@/apps/users/dto/create-user.dto';
import { UpdateUserDto } from '@/apps/users/dto/update-user.dto';
import { UsersPaginationParams } from '@/apps/users/types/user.types';
import { RoleService } from '@/apps/role/role.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userExists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    const roleExists = await this.roleService.findOne(createUserDto.role_id);
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    if (!roleExists) {
      throw new NotFoundException('Role not found');
    }
    const user = this.usersRepository.create({
      ...rest,
      role: { id: createUserDto.role_id },
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async paginate(
    params: UsersPaginationParams,
  ): Promise<PaginatedResponse<User[]>> {
    const { page, baseUrl, limit, orderBy } = params;

    let order = 'ASC'; // Default order
    let orderField = orderBy;

    if (orderBy?.startsWith('-')) {
      order = 'DESC';
      orderField = orderBy?.substring(1);
    }

    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderField]: order,
      },
      relations: ['role'],
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

  async findOne(id: number): Promise<ApiResponse<User> | undefined> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async findByEmail(email: string): Promise<ApiResponse<User> | undefined> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updated = Object.assign(user, updateUserDto);
    return this.usersRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
