import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsNumber({}, { each: true })
  permission: number[];
}
