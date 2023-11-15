import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@/apps/permission/dto';
import { PermissionService } from '@/apps/permission/permission.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { Request } from 'express';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
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
    return this.permissionService.paginate(paginationParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
