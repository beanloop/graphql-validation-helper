# graphql-validation-helper
[![Build Status](https://travis-ci.org/beanloop/graphql-validation-helper.svg?branch=master)](https://travis-ci.org/beanloop/graphql-validation-helper)
[![npm version](https://badge.fury.io/js/graphql-validation-helper.svg)](https://badge.fury.io/js/graphql-validation-helper)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)

## Install
```
yarn add graphql-validation-helper
npm install --save graphql-validation-helper
```

## Usage
```typescript
validatedMutation('user', gql`
  mutation createUser(
    $firstName: String!
    $lastName: String!
    $displayName: String!
    $email: String!
  ) {
    createUser(
      firstName: $firstName
      lastName: $lastName
      displayName: $displayName
      email: $email
    ) {
      id
      firstName
      lastName
      displayName
      email
    }
  }
`, {
  mapVariables(user) {
    return {...user, displayName: `${user.firstName}${user.lastName}`}
  },
}),
```

## License
graphql-validation-helper is dual-licensed under Apache 2.0 and MIT
terms.
