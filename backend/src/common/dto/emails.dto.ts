import { IsNotEmpty, IsEmail, IsString, IsOptional, IsNumber } from 'class-validator';
import { Contact } from '../entities/contact.entity';

class BaseEmailDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  contact: Contact;

  @IsOptional()
  @IsNumber()
  visibleOnlyCompany: string;
}

export class CreateEmailDto extends BaseEmailDto {}
export class UpdateEmailDto extends BaseEmailDto {}
