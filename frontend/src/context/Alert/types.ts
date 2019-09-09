export enum IAlertType {
  Success,
  Error,
  Warning,
}

export interface IAlert {
  id: string;
  message: string;
  type: IAlertType;
  dismiss: boolean;
}
