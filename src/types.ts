import { ApolloClient } from '@apollo/client';

export type DataInitType = {
  api: string;
  uri: string;
  publicUri: string;
};

export type ClientFunction = (client: ApolloClient<any>) => void;
