import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  password: string;

  @IsPositive()
  @IsNumber()
  @IsInt()
  age: number;

  @IsString()
  gender: string;

  @IsDateString()
  registrationDate: Date;
}
