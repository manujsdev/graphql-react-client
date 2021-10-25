import {
  ApolloClient,
  ApolloProvider,
  gql,
  useMutation,
  useQuery
} from '@apollo/client';
import gqlClient from './graphqlService';

export { gqlClient, ApolloClient, ApolloProvider, useMutation, useQuery, gql };
