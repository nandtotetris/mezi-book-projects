import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import config from '../utils/config';
// import { createHttpLink } from 'apollo-link-http';
import { createUploadLink } from 'apollo-upload-client';
import history from 'store/history';
// import getIp from 'utils/getIp';

let apolloClient = null;

async function create() {
  let client;
  let cache = new InMemoryCache({
    dataIdFromObject: object => {
      let id = defaultDataIdFromObject(object);
      if (
        typeof object.total !== 'undefined' &&
        typeof object.rows !== 'undefined'
      ) {
        id = null;
        // id = object.__typename;
      } else if (object) {
        switch (object.__typename) {
          case 'Company':
            id = object.id ? object.id : `${object.__typename}:${object.siret}`;
            break;
          case 'Beneficiary':
            id = `${object.__typename}:${object.userId}`;
            break;
          case 'Document':
            id = `${object.__typename}:${object.documentId}`;
            break;
          case 'Address':
            id = `${object.__typename}:${object.siret}`;
            break;
          default:
            id = defaultDataIdFromObject(object);
            break;
        }
      }

      return id;
    },
  });

  // let ip;
  // const cachedId = async () => {
  //   if (!ip) {
  //     ip = await getIp();
  //   }
  //   return ip;
  // };

  const authLink = setContext(async (_, { headers }) => {
    // const xForwardedFor = await cachedId();
    const _headers = {
      headers: {
        ...headers,
        Accept: 'application/json',
        'X-Powered-By': 'Libeo',
        // 'x-forwarded-for': xForwardedFor,
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    };

    return _headers;
  });

  const errorLink = onError(props => {
    const { graphQLErrors, networkError } = props;
    if (graphQLErrors) {
      //TODO : send to sentry
      graphQLErrors.map(errors => {
        const { message, extensions /*, locations, path */ } = errors;
        console.log(`[GraphQL error]`, graphQLErrors);

        if (extensions) {
          if (extensions.exception.status === 401) {
            localStorage.removeItem('token');
            history.push('/login');
            return null;
          }
        }
        if (message) {
          if (message.statusCode === 401) {
            localStorage.removeItem('token');
            history.push('/login');
            return null;
          }
        }
        return errors;
      });
    }

    if (networkError) {
      console.log('props', props);
      console.log('networkError', networkError);
    }
  });

  const domain = await config.domain();
  const graphqlUrl = `${domain}/graphql`;

  const uploadLink = createUploadLink({
    uri: graphqlUrl,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const link = ApolloLink.from([errorLink, authLink, uploadLink]);

  client = new ApolloClient({
    link,
    cache: cache,
    defaultOptions: {
      mutate: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
      watchQuery: {
        errorPolicy: 'all',
      },
    },
  });

  return client;
}

export default async function() {
  apolloClient = await create();

  return apolloClient;
}
