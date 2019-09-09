import { IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { PASSWORD_PATTERN } from './signup.dto';

export class SendPasswordResetEmail {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordPayload {
  @IsNotEmpty()
  confirmationToken: string;

  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN)
  password: string;

  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN)
  confirmPassword: string;
}

export class PasswordReset {
  status: boolean;
}
