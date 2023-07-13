import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsDateString()
  birth: Date;

  @IsString()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  password: string;
}
