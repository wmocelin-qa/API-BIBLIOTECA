const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon')

const app = require('../../../app')
const loanService = require('../../../services/loanService')

describe('Realizar Empréstimo', () => {
    let token;

    describe('POST /api/loans', () => {

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/api/login')
                .send({
                    username: 'juninho',
                    password: '1234'
                })

                token = respostaLogin.body.token;
        })

        it('Ao tentar realizar empréstimo de um livro disponível recebo status code 201', async () => {
            const loanServiceMock = sinon.stub(loanService, 'createLoan')
            loanServiceMock.returns({
                "message": "Empréstimo realizado",
                "book": {
                "id": 1,
                "title": "O Homem Mais Feliz do Mundo: A Bela Vida de um Sobrevivente de Auschwitz",
                "author": "Eddie Jaku",
                "available": false
                }
            })

            const resposta = await request(app)
            .post('/api/loans')
            .set('Authorization', `Bearer ${token}`)
            .send({
                bookId: 2
            })

            expect(resposta.status).to.equal(201)
            expect(resposta.body).to.have.property('message', 'Empréstimo realizado')
        })

         it('Ao tentar realizar empréstimo de um livro indisponível recebo status code 400', async () => {
            const loanServiceMock = sinon.stub(loanService, 'createLoan')
            loanServiceMock.throws(new Error('Livro não disponível para empréstimo'))

            const resposta = await request(app)
                .post('/api/loans')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 2
            })

            expect(resposta.status).to.equal(400) // verificar
            expect(resposta.body).to.have.property('error', 'Livro não disponível para empréstimo')
        })

         it('Ao tentar realizar empréstimo de um livro sem token recebo status code 401', async () => {
            const loanServiceMock = sinon.stub(loanService, 'createLoan')
            loanServiceMock.throws(new Error('Token não fornecido'))

            const resposta = await request(app)
                .post('/api/loans')
                //.set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 44
            })

            expect(resposta.status).to.equal(401)
            expect(resposta.body).to.have.property('error', 'Token não fornecido')
        })

        /*it.only('Ao devolver um livro pertencente ao usuário, recebo status code 200', async () => {
            const loanServiceMock = sinon.stub(loanService, 'returnLoan')
            loanServiceMock.returns({
                "message": "Livro devolvido com sucesso"
            })

            const resposta = await request(app)
                .post('/api/returns')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 2
            })

            expect(resposta.status).to.equal(200)
            //expect(resposta.body).to.have.property('message', 'Livro devolvido com sucesso')
        })*/

        afterEach(() => {
            sinon.restore();
        })
    })
})