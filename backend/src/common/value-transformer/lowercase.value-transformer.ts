import { ValueTransformer } from 'typeorm';

export const lowercase: ValueTransformer = {
    to: (entityValue: string) => {
      return entityValue.toLocaleLowerCase();
    },
    from: (databaseValue: string) => {
      return databaseValue;
    },
};
