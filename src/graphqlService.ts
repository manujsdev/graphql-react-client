import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache,
  Observable
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';

export type DataInitType = {
  api: string;
  uri: string;
  publicUri: string;
};

export class GraphqlService {
  _client: any = undefined;
  _token: string | undefined = undefined;
  _api = ''; // https://myapi.com
  _uri = ''; // /api/
  _publicUri = ''; // publicApi

  get client() {
    return this._client;
  }
  set client(client: any) {
    this._client = client;
  }
  getToken() {
    return this._token;
  }
  setToken(token: string | undefined) {
    this._token = token;
  }
  getApi() {
    return this._api;
  }
  setApi(api: string) {
    this._api = api;
  }
  getUri() {
    return this._uri;
  }
  setUri(uri: string) {
    this._uri = uri;
  }
  getPublicUri() {
    return this._publicUri;
  }
  setPublicUri(publicUri: string) {
    this._publicUri = publicUri;
  }

  init(initData: DataInitType) {
    const { api, uri, publicUri } = initData;
    this._api = api;
    this._uri = uri;
    this._publicUri = publicUri;
  }

  /**
   *
   * @param networkError example {
   *   statusCode: 403
   * }
   */
  actionNetworkError(networkError: any) {
    if (networkError) {
      const { statusCode } = networkError;
      if (statusCode === 500) {
        console.log('Cannot connect to server');
      } else if (statusCode === 403) {
        // TODO logout and redirect to login
        // authService.logout();
        // authService.redirectToLogin();
      } else {
        console.log(
          'Please wait, at this moment cannot connect to the server.'
        );
      }
    }
  }

  /**
   * @description call apollo-link-error
   */
  errorLink = onError(({ graphQLErrors, networkError }) =>
    this.actionNetworkError(networkError)
  );

  /**
   * @returns a public apollo client
   */
  createPublicClient() {
    return new ApolloClient({
      link: ApolloLink.from([
        this.errorLink,
        new HttpLink({
          uri: `${this._api}${this._uri}${this._publicUri}`,
          credentials: 'same-origin'
        })
      ]),
      cache: new InMemoryCache()
    });
  }

  /**
   *
   * @param callback
   */
  publicRequest(callback: any) {
    return new Promise((resolve, reject) => {
      const client = this.createPublicClient();
      resolve(callback(client));
    });
  }

  /**
   *
   * @param schema schema name
   * @param variables variables to filter, etc
   */
  publicQuery(schema: string, variables: any) {
    return this.publicRequest((client: ApolloClient<any>) => {
      return client.query({
        query: gql`
          ${schema}
        `,
        variables
      });
    });
  }

  /**
   *
   * @param schema schema name
   * @param variables variables to mutate
   */
  publicMutate(schema: string, variables: any) {
    return this.publicRequest((client: ApolloClient<any>) => {
      return client.mutate({
        mutation: gql`
          ${schema}
        `,
        variables
      });
    });
  }

  /**
   * @description update context with token auth
   */
  requestApollo = async (operation: any) => {
    operation.setContext({
      headers: {
        authorization: this._token ? `Bearer ${this._token}` : ''
      }
    });
  };

  requestLink: any = new ApolloLink(
    (operation: any, forward: any) =>
      new Observable(observer => {
        let handle: any;
        Promise.resolve(operation)
          .then(oper => this.requestApollo(oper))
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            });
          })
          .catch(observer.error.bind(observer));

        return () => {
          handle?.unsubscribe?.();
        };
      })
  );

  /**
   * @returns a private apollo client
   */
  createPrivateClient(scope: string) {
    return new ApolloClient({
      link: ApolloLink.from([
        this.errorLink,
        this.requestLink,
        createUploadLink({
          uri: `${this._api}${this._uri}${scope}`
        }) as any
      ]),
      cache: new InMemoryCache()
    });
  }

  /**
   *
   * @param scope should be public, webApp, etc
   * @returns a client graphql
   */
  async getClient(scope = 'websiteBackend') {
    return this.client ? this.client : this.createPrivateClient(scope);
  }

  /**
   *
   * @param scope should be public, webApp, etc
   * @param callback a client graphql
   */
  async request(scope: string, callback: any) {
    const client = await this.getClient(scope);
    return callback(client);
  }

  /**
   *
   * @param scope should be public, webApp, etc
   * @param schema should be a query
   * @param variables should be a variables
   */
  query(scope: string, schema: string, variables: any) {
    return this.exec(scope, schema, variables, false);
  }

  /**
   *
   * @param scope should be public, webApp, etc
   * @param schema should be a mutation
   * @param variables should be a variables
   */
  mutate(scope: string, schema: string, variables: any) {
    return this.exec(scope, schema, variables);
  }

  /**
   *
   * @param scope
   * @param schema
   * @param variables
   * @param mutate
   */
  private exec = (
    scope: string,
    schema: string,
    variables: any,
    mutate = true
  ) => {
    return this.request(scope, (client: ApolloClient<any>) => {
      return (client as any)[mutate ? 'mutate' : 'query']({
        [mutate ? 'mutation' : 'query']: gql`
          ${schema}
        `,
        variables
      });
    });
  };
}

const gqlClient = new GraphqlService();
export default gqlClient;
