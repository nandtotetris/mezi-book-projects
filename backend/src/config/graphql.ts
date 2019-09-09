// import { join } from 'path';
import { GraphQLUpload } from 'graphql-upload';
import { GqlModuleOptions } from '@nestjs/graphql';

const graphqlConfig: GqlModuleOptions = {
  typePaths: ['./**/*.graphql'],
  // definitions: {
  //   path: join(process.cwd(), 'src/graphql.schema.ts'),
  //   outputAs: 'class',
  // },
  installSubscriptionHandlers: true,
  resolvers: { Upload: GraphQLUpload },
  debug: (process.env.GRAPHQL_DEBUG === 'true'),
  playground: (process.env.GRAPHQL_PLAYGROUND === 'true'),
  context: ({ req }) => ({ req }),
};

export default graphqlConfig;
