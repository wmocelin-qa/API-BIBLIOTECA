const request = require('supertest');
const { expect } = require('chai'); 

describe('Realizar Empréstimo via API GraphQL - External', () => {
    let token;
    let baseUrl = 'http://localhost:4000';

    beforeEach(async () => {
        const loginMutation = `mutation Login($username: String!, $password: String!) {
                                login(username: $username, password: $password) {
                                    token
  }
}`

        const loginVariables = {
            username: "juninho",
            password: "1234"
        }

        const respostaLogin = await request(baseUrl) 
            .post('/graphql')
            .send({
                query: loginMutation,
                variables: loginVariables
            })

            token = respostaLogin.body.data.login.token;
            //console.log(token) apenas para testes
    })

    it('Ao tentar realizar empréstimo de um livro disponível recebo mensagem de empréstimo realizado', async () => {
        const resposta = await request(baseUrl)
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation BorrowBook($bookId: ID!) {
                        borrowBook(bookId: $bookId) {
                        message
  }
}`,
                variables: {
                    bookId: 1
                }
            })

            expect(resposta.status).to.equal(200)
            const respostaEsperada = require('../fixtures/quandoRealizoEmprestimoDeLivroDisponivel.json')
            expect(resposta.body).to.deep.equal(respostaEsperada)
    })

    it('Ao tentar realizar empréstimo de um livro indisponível recebo mensagem livro não encontrado ou não está disponível para empréstimo.', async () => {
        const resposta = await request(baseUrl)
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation BorrowBook($bookId: ID!) {
                        borrowBook(bookId: $bookId) {
                        message
  }
}`,
                variables: {
                    bookId: 1
                }
            })

            expect(resposta.status).to.equal(200)
            respostaEsperada = require('../fixtures/quandoRealizoEmprestimoDeLivroNaoDisponivel.json')
            expect(resposta.body.errors[0].message).to.equal(respostaEsperada.errors[0].message);
    })

    it('Ao tentar realizar empréstimo de um livro sem token recebo mensagem você precisa estar logado para realizar um empréstimo.', async () => {
        const resposta = await request(baseUrl)
            .post('/graphql')
            //.set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation BorrowBook($bookId: ID!) {
                        borrowBook(bookId: $bookId) {
                        message
  }
}`,
                variables: {
                    bookId: 2
                }
            })

            expect(resposta.status).to.equal(200)
            const respostaEsperada = require('../fixtures/realizarEmprestimoSemAutenticacaoDeUsuario.json')
            expect(resposta.body.errors[0].message).to.equal(respostaEsperada.errors[0].message);
    })

})