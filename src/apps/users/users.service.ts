import { RoleService } from '@/apps/role/role.service';
import { CreateUserDto, UpdateUserDto } from '@/apps/users/dto';
import { User } from '@/apps/users/entities/user.entity';
import { AbstractCrudService } from '@/common/services/abstract.crud.service';
import { AbstractPaginationParams } from '@/common/types/pagination.type';
import { ApiResponse, PaginatedResponse } from '@/common/types/response.type';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class UsersService extends AbstractCrudService<
  User,
  CreateUserDto,
  UpdateUserDto,
  FindManyOptions<User>
> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {
    super(usersRepository);
  }

  protected get entityName(): string {
    return 'User';
  }

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const userExists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    const roleExists = await this.roleService.findOne(createUserDto.role_id);
    if (!roleExists) {
      throw new NotFoundException('Role not found');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: roleExists.data,
    });
    const savedUser = await this.usersRepository.save(user);

    return {
      success: true,
      message: 'User created successfully',
      data: savedUser,
    };
  }

  async paginate(
    params: AbstractPaginationParams<User>,
  ): Promise<PaginatedResponse<User[]>> {
    return super.paginate(params, {
      relations: ['role', 'products'],
    });
  }

  async findByEmail(email: string): Promise<ApiResponse<User> | undefined> {
    return super.findByEmail(email, {
      relations: ['role'],
    });
  }

  async findOne(id: number): Promise<ApiResponse<User>> {
    return super.findOne(id, {
      relations: ['role', 'role.permissions', 'products'],
    });
  }
}
