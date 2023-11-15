import { AuthGuard } from '@/apps/auth/guard/auth.guard';
import { CreateUserDto } from '@/apps/users/dto/create-user.dto';
import { UpdateUserDto } from '@/apps/users/dto/update-user.dto';
import { UsersService } from '@/apps/users/users.service';
import { Roles } from '@/common/decorators/role.decorators';
import { RoleGuard } from '@/common/guards/role.guard';
import { UserRole } from '@/common/types/role.enum';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
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
    return this.usersService.paginate(paginationParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
