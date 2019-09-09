export interface ITreezorBasePayload {
  accessSignature?: string;
  accessTag?: string;
  accessUserId?: number;
  accessUserIp?: string;
}

export enum SortOrder {
  DESC = 'DESC',
  ASC  = 'ASC',
}
