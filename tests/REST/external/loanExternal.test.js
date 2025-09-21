const request = require('supertest');
const { expect } = require('chai');

describe('Realizar Empréstimo via External', () => {
    let token;

    describe('POST /api/loans', () => {

        beforeEach(async () => {
            const respostaLogin = await request('http://localhost:3000')
                .post('/api/login')
                .send({
                    username: 'juninho',
                    password: '1234'
                })

                token = respostaLogin.body.token;
        })

        it('Ao tentar realizar empréstimo de um livro disponível recebo status code 201', async () => {
        const resposta = await request('http://localhost:3000')
            .post('/api/loans')
            .set('Authorization', `Bearer ${token}`)
            .send({
                bookId: 3
            })

            expect(resposta.status).to.equal(201)
            expect(resposta.body).to.have.property('message', 'Empréstimo realizado')
        })

         it('Ao tentar realizar empréstimo de um livro indisponível recebo status code 400', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/loans')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 3
            })

            expect(resposta.status).to.equal(400)
            expect(resposta.body).to.have.property('error', 'Livro não disponível para empréstimo')
        })

        it('Ao tentar realizar empréstimo de um livro sem token recebo status code 401', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/api/loans')
                //.set('Authorization', `Bearer ${token}`)
                .send({
                    bookId: 44
            })

            expect(resposta.status).to.equal(401)
            expect(resposta.body).to.have.property('error', 'Token não fornecido')
        })

        /*it('Ao devolver um livro pertencente ao usuário, recebo status code 200', async () => {
                const resposta = await request('http://localhost:3000')
                    .post('/api/returns')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        bookId: 3
            })
            
            //expect(resposta.status).to.equal(200)
            expect(resposta.body).to.have.property('message', 'Livro devolvido com sucesso')
        })*/
    })
})
