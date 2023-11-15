import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;
}
