import { IsOptional, IsNotEmpty, IsArray, IsString, Matches, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BaseContactDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z-\s]+$/)
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z-\s]+$/)
  lastname: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Email)
  emails?: Email[];
}

class Email {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class CreateContactDto extends BaseContactDto {}
export class UpdateContactDto extends BaseContactDto {}
