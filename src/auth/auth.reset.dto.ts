import { IsJWT, IsString, IsStrongPassword } from 'class-validator';

export class AuthResetDTO {
  @IsJWT()
  token: string;

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
