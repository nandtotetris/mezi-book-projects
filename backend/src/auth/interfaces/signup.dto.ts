import { Matches, IsNotEmpty, IsEmail } from 'class-validator';

export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~])(?=.{8,})/;

export class SignUpPayload {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z-\s]+$/)
  firstname: string;

  @IsNotEmpty()
  @Matches(/^[a-zA-Z-\s]+$/)
  lastname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN)
  password: string;

  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN)
  passwordConfirmation: string;

  cgu: boolean;
}
