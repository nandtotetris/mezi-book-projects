export interface ITaxResidence {
  id: number;
  userId: number;
  country: string;
  taxPayerId: string;
  liabilityWaiver: boolean;
  createdDate: string;
  lastUpdate: string;
  deletedDate: string;
  isDeleted: boolean;
}

export interface ICreateTaxResidenceParams {
  userId: number;
  country: string;
  taxPayerId: string;
  liabilityWaiver: boolean;
}

export interface IUpdateTaxResidenceParams extends ICreateTaxResidenceParams {
  taxResidenceId: number;
}
