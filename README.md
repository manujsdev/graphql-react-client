# graphql-react-client ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Apollo Client service for React applications

## Installation

`npm i -s graphql-react-client`
or
`yarn add graphql-react-client`

## Usage

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import App from './App';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { gqlClient } from 'graphql-react-client';
import authService from './shared/services/authService';

gqlClient.init({
    api: `${process.env.REACT_APP_API}`,
    uri: '/api/',
    publicUri: '/api/public'
});

async function initScope(scope) {
    const sessionData: any = await authService.getSessionData();
    authService.login(sessionData);
    return sessionData?.mainRole === 'TYPE_CUSTOMER' ? 'customer' : scope;
}
let scope;
initScope('privateScope').then(response => {
    scope = response;
});

gqlClient.getClient(scope).then(async (client: ApolloClient<any>) => {
    ReactDOM.render(
        <ApolloProvider {...{ client }}>
            <App />
        </ApolloProvider>,
        document.getElementById('root')
    );
});

```
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
```
