import { AuthModule } from '@/apps/auth/auth.module';
import { PermissionModule } from '@/apps/permission/permission.module';
import { RoleModule } from '@/apps/role/role.module';
import { UsersModule } from '@/apps/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './apps/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgresql',
      port: 5432,
      username: 'root',
      password: 'adminpassword',
      database: 'admindb',
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    UsersModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
