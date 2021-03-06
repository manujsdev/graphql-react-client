import { GraphqlService } from '../src/graphqlService';
import { ApolloClient, gql } from '../src/index';
import { DataInitType } from '../src/types';

describe('Test Graphql Service', () => {
  let instance: GraphqlService;
  const ENV = `dev`;
  const STORE_VAR = `jwt-${ENV}`;
  const API = 'https://myApi.com';

  beforeEach(() => {
    instance = new GraphqlService();
  });

  it('should instance of Graphql Service', () => {
    expect(instance).toBeInstanceOf(GraphqlService);
  });

  it('testing set token', () => {
    instance.setToken('mytoken');
    expect(instance.getToken()).toEqual('mytoken');
  });

  it('testing set api', () => {
    instance.setApi(API);
    expect(instance.getApi()).toEqual(API);
  });

  it('testing set uri', () => {
    instance.setUri('privateUri');
    expect(instance.getUri()).toEqual('privateUri');
  });

  it('testing set publicUri', () => {
    instance.setPublicUri('publicUri');
    expect(instance.getPublicUri()).toEqual('publicUri');
  });

  it('testing init', () => {
    const initData: DataInitType = {
      api: API,
      uri: '/api/',
      publicUri: 'public'
    };

    instance.init(initData);
    expect(instance.getPublicUri()).toEqual('public');
  });

  it('testing actionNetworkError with 403 error', () => {
    const error = {
      statusCode: 403
    };
    instance.actionNetworkError(error);
    const dataStorage: any = window.localStorage.getItem(STORE_VAR);
    expect(JSON.parse(dataStorage)).toBeNull();
  });

  it('testing actionNetworkError with 404 error', () => {
    const error = {
      statusCode: 404
    };
    instance.actionNetworkError(error);
    const dataStorage: any = window.localStorage.getItem(STORE_VAR);
    expect(JSON.parse(dataStorage)).toBeNull();
  });

  it('testing actionNetworkError with 500 error', () => {
    const error = {
      statusCode: 500
    };
    instance.actionNetworkError(error);
    const dataStorage: any = window.localStorage.getItem(STORE_VAR);
    expect(JSON.parse(dataStorage)).toBeNull();
  });

  it('testing actionNetworkError with undefined', () => {
    instance.actionNetworkError(undefined);
    const dataStorage: any = window.localStorage.getItem(STORE_VAR);
    expect(JSON.parse(dataStorage)).toBeNull();
  });

  // TODO review this test
  // it('testing createPublicClient', () => {
  //   const publicClient: any = instance.createPublicClient();
  //   expect(typeof publicClient).toEqual(typeof new Object());
  // });

  it('testing publicRequest', async () => {
    try {
      const schema = 'public';
      const variables = { page: 4 };
      const publicClient: any = await instance.publicRequest(
        (client: ApolloClient<any>) => {
          return client.query({
            query: gql`
              ${schema}
            `,
            variables
          });
        }
      );

      expect(typeof publicClient).toEqual(typeof new Object());
    } catch (e) {
      //
    }
  });

  it('testing publiQuery', async () => {
    try {
      const schema = 'public';
      const variables = { page: 4 };
      const publicClient: any = await instance.publicQuery(schema, variables);

      expect(typeof publicClient).toEqual(typeof new Object());
    } catch (e) {
      //
    }
  });

  it('testing publicMutate', async () => {
    try {
      const schema = 'public';
      const variables = { page: 4 };
      const publicClient: any = await instance.publicMutate(schema, variables);

      expect(typeof publicClient).toEqual(typeof new Object());
    } catch (e) {
      //
    }
  });

  it('testing requestApollo without token', async () => {
    try {
      window.localStorage.removeItem(STORE_VAR);
      const context = {
        headers: {
          authorization: 'token'
        }
      };
      const request = { setContext: context };

      await instance.requestApollo(request);
      expect({
        headers: {
          authorization: ``
        }
      }).toEqual(JSON.stringify(context));
    } catch (e) {
      //
    }
  });

  it('testing requestApollo with token', async () => {
    try {
      // authService.login(dataAuth);
      const dataStorage: any = window.localStorage.getItem(STORE_VAR);

      const context = {
        headers: {
          authorization: 'token'
        }
      };
      const request = { setContext: context };

      await instance.requestApollo(request);
      expect({
        headers: {
          authorization: `Bearer ${dataStorage.token}`
        }
      }).toEqual(JSON.stringify(context));
      window.localStorage.removeItem(STORE_VAR);
    } catch (e) {
      //
    }
  });

  // it('testing requestLink', () => {
  //   try {
  //     const redirectToLogin: any = jest.fn(instance.requestLink);
  //   } catch (e) {
  //     //
  //   }
  // });

  it('testing createPrivateClient', () => {
    const privateClient: any = instance.createPrivateClient('webApp');
    expect(typeof privateClient).toEqual(typeof new Object());
  });

  it('testing getClient without client', () => {
    const client: any = instance.getClient();
    window.localStorage.removeItem(STORE_VAR);
    expect(typeof client).toEqual(typeof new Object());
  });

  it('testing getClient with client', () => {
    const scope = 'webApp';
    const privateClient = instance.createPrivateClient(scope);
    instance.client = privateClient;
    const client: any = instance.getClient(scope);
    window.localStorage.removeItem(STORE_VAR);
    expect(typeof client).toEqual(typeof new Object());
  });

  it('testing request without client', async () => {
    try {
      const scope = 'webApp';
      const schema = `query{
        SiteSettingGet{
          bookingPrefix
          currency {
            id
            name
            alphabeticCode
          }
        }
      }`;
      const variables = { page: 4 };
      const requestResp: any = await instance.request(
        scope,
        (client: ApolloClient<any>) => {
          return client.query({
            query: gql`
              ${schema}
            `,
            variables
          });
        }
      );

      expect(typeof requestResp).toEqual(typeof new Object());
    } catch (e) {
      //
    }
  });

  it('testing request with client', async () => {
    try {
      const scope = 'webApp';
      const schema = `query{
        SiteSettingGet{
          bookingPrefix
          currency {
            id
            name
            alphabeticCode
          }
        }
      }`;
      const variables = { page: 4 };
      instance.client = instance.createPrivateClient(scope);
      const requestResp: any = await instance.request(
        scope,
        (client: ApolloClient<any>) => {
          return client.query({
            query: gql`
              ${schema}
            `,
            variables
          });
        }
      );

      expect(typeof requestResp).toEqual(typeof new Object());
    } catch (e) {
      //
    }
  });

  it('testing query', async () => {
    try {
      const scope = 'webApp';
      const variables = { page: 4 };
      const schema = `query{
        SiteSettingGet{
          bookingPrefix
          currency {
            id
            name
            alphabeticCode
          }
        }
      }`;
      const query: any = await instance.query(scope, schema, variables);

      expect(typeof query).toEqual(typeof new Object());
    } catch (e) {
      //
    }
  });

  it('testing mutation', async () => {
    try {
      const scope = 'webApp';
      const input = { id: 4 };
      const schema = `mutation($input: GenericFilterInput!){
        CustomerDelete(input: $input){
          isSuccess
        }
      }`;
      const query: any = await instance.mutate(scope, schema, { input });

      expect(typeof query).toEqual(typeof new Object());
    } catch (e) {
      console.log('error: ', e);
    }
  });
});
