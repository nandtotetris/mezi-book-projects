import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignInPayload {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
