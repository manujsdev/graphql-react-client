# graphql-react-client ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Apollo Client service for React applications

## Installing

Using npm:

`npm i -s graphql-react-client`

Using yarn:

`yarn add graphql-react-client`

## Usage

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import App from './App';
import { ApolloClient, ApolloProvider, gqlClient } from 'graphql-react-client';
import authService from './shared/services/authService';

gqlClient.init({
  api: `${process.env.REACT_APP_API}`,
  uri: '/api/',
  publicUri: 'public'
});

async function initScope(scope) {
  const { token, mainRole } = await authService.getSessionData();
  gqlClient.token = token;
  return mainRole === 'TYPE_CUSTOMER' ? 'customer' : scope;
}

initScope('privateScope').then(scope => {
  gqlClient.getClient(scope).then((client: ApolloClient<any>) => {
    ReactDOM.render(
      <ApolloProvider {...{ client }}>
        <App />
      </ApolloProvider>,
      document.getElementById('root')
    );
  });
});
```

## Example of urls:

### Private scope:

`https://myurl.com/api/privateScope`

### Customer scope:

`https://myurl.com/api/customer`

### Public scope:

`https://myurl.com/api/public`

#### and that's it, try it.

## Use in the services.

```typescript
import { gqlClient } from 'graphql-react-client';

const GET = `
query ($input: CoreGetInput!){
  CustomerGet(input: $input){
    id
    name
  }
}
`;

async get(input: any): Promise<CustomerType> {
    const response = await gqlClient.query('myScope', GET, { input });
return response.data.CustomerGet;
}

async update(variables: any, scheme: string) {
    const response: any = await gqlClient.mutate('myScope', scheme, variables);
    return response.data;
}
```

## Use in the components.

```typescript
import { useQuery } from 'graphql-react-client';

export const GET_LIST = gql`
  query($input: GenericFilterInput) {
    OrderList(input: $input) {
      page
      pageSize
      total
      items {
        id
        customerFullName
        createdAt
        status
      }
    }
  }
`;

const { data, error, loading, refetch } = useQuery(GET_LIST, {
  variables: {
    input: {
      page,
      pageSize,
      order: orderBy,
      where: getFilter(where)
    }
  },
  fetchPolicy: 'network-only'
});
```
