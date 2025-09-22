const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    available: Boolean!
  }

  type Loan {
    id: ID!
    book: Book!
    user: User!
    returned: Boolean!
  }

  type User {
    id: ID!
    username: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    availableBooks: [Book!]!
    myLoans: [Loan!]!
    users: [User!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    register(username: String!, password: String!): User!
    borrowBook(bookId: ID!): Loan!
    returnBook(loanId: ID!): Loan!
    addBook(title: String!, author: String!): Book!
  }
`;

module.exports = typeDefs;
