import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(2, 30)
  username: string;

  @IsOptional()
  @Length(2, 200)
  @IsString()
  about: string;

  @IsOptional()
  @IsUrl()
  avatar: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(2)
  password: string;
}
