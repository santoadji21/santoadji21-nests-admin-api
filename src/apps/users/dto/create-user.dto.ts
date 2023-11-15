import {
  IsString,
  IsEmail,
  MinLength,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  password: string;

  @IsNumber()
  @IsNotEmpty()
  role_id: number;
}
