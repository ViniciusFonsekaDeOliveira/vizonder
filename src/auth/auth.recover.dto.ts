import { IsEmail } from 'class-validator';

export class AuthRecoverDTO {
  @IsEmail()
  email: string;
}
