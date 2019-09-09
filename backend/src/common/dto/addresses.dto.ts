export class CreateAddressDto {
  id?: string;
  siret?: string;
  address1: string;
  address2: string;
  zipcode?: number;
  city?: string;
  country?: string;
  companyId?: string;
  company?: any;
}
