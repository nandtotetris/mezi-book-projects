export class CreateUserDto {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  cgu: boolean;
}

export class UpdateUserDto {
  firstname: string;
  lastname: string;
  email: string;
  phone?: boolean;
  password?: string;
}
