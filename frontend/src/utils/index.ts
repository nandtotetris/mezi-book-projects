import { ApolloClient, FetchPolicy } from 'apollo-client';
import { IAlertInterface } from 'context/Alert/context';

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const findConstraints = (message: any): any => {
  let res;
  if (message.children && message.children.length > 0) {
    return findConstraints(message.children[0]);
  } else if (message.constraints) {
    res = message.constraints[Object.keys(message.constraints)[0]];
    res = typeof res === 'string' ? res : res.error;
  }
  return res;
};

export const parseError = (error: any): string[] => {
  const errorStringOrArray: string[] = [];
  if (error && error.graphQLErrors && error.graphQLErrors.length > 0) {
    error.graphQLErrors.map((err: any) => {
      if (Array.isArray(err.message)) {
        err.message.map((message: any) => {
          errorStringOrArray.push(findConstraints(message));
        });
      } else if (typeof err.message === 'string') {
        errorStringOrArray.push(err.message);
      } else if (
        err.message &&
        err.message.statusCode &&
        err.message.statusCode === 401
      ) {
        errorStringOrArray.push('api.error.unauthorized');
      } else {
        errorStringOrArray.push('api.error.unknow');
      }
    });
  } else if (error && Array.isArray(error) && error.length > 0) {
    error.map((err: any) => {
      if (Array.isArray(err.message)) {
        err.message.map((message: any) => {
          errorStringOrArray.push(findConstraints(message));
        });
      } else if (typeof err.message === 'string') {
        errorStringOrArray.push(err.message);
      } else if (
        err.message &&
        err.message.statusCode &&
        err.message.statusCode === 401
      ) {
        errorStringOrArray.push('api.error.unauthorized');
      } else {
        errorStringOrArray.push('api.error.unknow');
      }
    });
  } else if (typeof error === 'string') {
    errorStringOrArray.push(error);
  } else if (error) {
    errorStringOrArray.push('api.error.unknow');
  }
  return errorStringOrArray;
};

export const mutate = async ({
  client,
  mutation,
  refetchQueries,
  variables,
}: {
  client: ApolloClient<any>;
  mutation: any;
  refetchQueries?: any[];
  variables?: any;
}): Promise<{ cache: any; results?: any; error?: any }> => {
  try {
    const results: any = await client.mutate({
      awaitRefetchQueries: true,
      mutation,
      refetchQueries,
      variables,
    });
    return { cache: client.cache, results };
  } catch (error) {
    return { cache: client.cache, error: parseError(error) };
  }
};

export const request = async ({
  client,
  query,
  variables,
  fetchPolicy,
}: {
  client: ApolloClient<any>;
  query: any;
  variables?: any;
  fetchPolicy?: FetchPolicy;
}): Promise<{ cache: any; results?: any; error?: any }> => {
  try {
    const results: any = await client.query({
      fetchPolicy,
      query,
      variables,
    });
    return { cache: client.cache, results };
  } catch (error) {
    return { cache: client.cache, error: parseError(error) };
  }
};

export const errorOrSuccess = (
  alert: IAlertInterface | undefined,
  errors: string[],
  successes?: string[],
  dismiss?: boolean,
) => {
  if (alert) {
    alert.reset();
    if (errors && errors.length > 0) {
      errors.map(error => alert.error(error, dismiss || true));
    } else if (successes && successes.length > 0) {
      successes.map(success => {
        return alert.success(success, dismiss || true);
      });
    }
  }
};

export const updateStoreRows = (
  key: string,
  newItem: any,
  oldArray: any,
): any => {
  if (!oldArray && !oldArray.rows) {
    return { total: 1, rows: [newItem] };
  }

  let rows: any[] = oldArray.rows;
  rows = rows.map(row => {
    if (row[key] === newItem[key]) {
      return newItem;
    } else {
      return row;
    }
  });

  oldArray.rows = rows;

  return oldArray;
};
