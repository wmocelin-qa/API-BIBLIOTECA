# API Biblioteca

API para gerenciamento de biblioteca, desenvolvida em Node.js. Permite cadastro e login de usuários, consulta de livros disponíveis, empréstimo e devolução de livros, além de consulta dos empréstimos do usuário. Disponível em duas interfaces: REST (Express) e GraphQL (Apollo Server).

## Instalação

1. Clone o repositório ou copie os arquivos para seu ambiente.
2. Instale as dependências REST e GraphQL (atenção às versões!):
   ```bash
   npm install express@4.18.2 body-parser jsonwebtoken swagger-ui-express apollo-server-express@3 graphql
   ```

## Executando a API REST

- Para iniciar o servidor REST:
  ```bash
  node server.js
  ```
- O servidor será iniciado na porta 3000 por padrão.
- Documentação Swagger disponível em `/api-docs`.

## Executando a API GraphQL

- Para iniciar o servidor GraphQL:
  ```bash
  node graphql/server.js
  ```
- O servidor será iniciado na porta 4000 por padrão.
- Playground GraphQL disponível em [http://localhost:4000/graphql](http://localhost:4000/graphql)

## Autenticação JWT

- Para empréstimos, devolução e consulta de empréstimos (REST) e mutations de transferências (GraphQL), inclua o token JWT no header:
  ```
  Authorization: Bearer <seu_token>
  ```
- O token é obtido via endpoint/mutation de login.

## Testes

- Para testar a API REST, utilize os testes em `tests/REST`.
- Para testar a API GraphQL com Supertest, importe o `app` de `graphql/app.js`.

## Estrutura do Projeto

- `app.js` e `server.js`: REST
- `graphql/app.js` e `graphql/server.js`: GraphQL
- `controllers/`, `services/`, `models/`, `routes/`: lógica de negócio
- `graphql/typeDefs.js`: Definição dos tipos GraphQL
- `graphql/resolvers.js`: Implementação dos resolvers
- `tests/`: testes automatizados

## Endpoints REST

- `POST /api/register` - Cadastro de usuário
- `POST /api/login` - Login de usuário (retorna JWT)
- `GET /api/books` - Consulta livros disponíveis
- `POST /api/loans` - Realizar empréstimo de livro (requer Bearer Token)
- `POST /api/returns` - Devolução de livro (requer Bearer Token)
- `GET /api/myloans` - Consultar meus empréstimos (requer Bearer Token)
- `GET /api-docs` - Documentação Swagger

## Queries e Mutations GraphQL

- `login(username, password): AuthPayload` - Login e obtenção de token
- `register(username, password): User` - Cadastro de usuário
- `availableBooks: [Book]` - Consulta livros disponíveis
- `borrowBook(bookId): Loan` - Realizar empréstimo (requer Bearer Token)
- `returnBook(loanId): Loan` - Devolução de livro (requer Bearer Token)
- `myLoans: [Loan]` - Consultar meus empréstimos (requer Bearer Token)
- `addBook(title, author): Book` - Cadastro de livro

## Observações

- O banco de dados é em memória, os dados são perdidos ao reiniciar o servidor.
- Não é permitido cadastrar usuários nulos, em branco ou duplicados.
- Só é possível reservar livros disponíveis.
- Os Types, Queries e Mutations GraphQL foram definidos com base nos dados e métodos utilizados nos testes da API REST.
- As fixtures dos testes REST foram consideradas para garantir compatibilidade de entrada e saída.

## Conceitos empregados neste projeto: 

- Thresholds:
Implementado no arquivo: tests/k6/script-performance.js linha 11. 
Implementado no arquivo: tests/k6/script-login.js linha 15. 

- Checks
Implementado check para verificação de status code no arquivo tests/k6/script-performance.js nas linhas: 37, 54, 70 e 85. 
Implementado check para verificação de status code no arquivo tests/k6/script-login.js na linha: 37. 

- Helpers
Criei um helper para BASE_URL em tests/k6/helpers/baseUrl.js e utilizei nas linhas 23 para chamada da função, 32, 49, 65, 80 no arquivo tests/k6/script-performance.js para os endpoints.
Usado também no arquivo tests/k6/script-login.js na linha 20 para armazenar em uma variável e utilizada a variável na linha 28.

- Trends
Importei na linha 5 do arquivo tests/k6/script-performance.js;
Criei uma nova Trend neste mesmo arquivo na linha 8;
E na linha 74 do arquivo utilizei a métrica personalizada postLoanDurationTrend.add(responseLoans.timings.duration); 

- Faker
Importei a biblioteca na linha 6. 
Utilizei nas variáveis username, password nas linhas 27 e 28 do arquivo .\tests\k6\script-performance.js.

- Variável de Ambiente
Criei um helper para BASE_URL em tests/k6/helpers/baseUrl.js e utilizei nas linhas 23 para chamada da função, 32, 49, 65, 80 no arquivo tests/k6/script-performance.js para os endpoints.
E a execução do k6 é por meio do comando 'k6 run .\tests\k6\script-performance.js --env BASE_URL=http://localhost:3000'

- Stages
Linha 15 a 20 no arquivo de tests/k6/script-performance.js uso do stages. 

- Reaproveitamento de Resposta
Linha 67 do arquivo tests/k6/script-performance.js reutilizei o token da resposta para realizar um empréstimo e depois para realizar a devolução na linha: 82. 

- Uso de Token de Autenticação
Uso do token no arquivo tests/k6/script-performance.js linha 67 para autenticação do usuário no empréstimo. 
Uso do token no arquivo tests/k6/script-performance.js linha 82 para autenticação do usuário na devolução.

- Data-Driven Testing
Importação do SharedArray na linha 5 do arquivo tests/k6/script-login.js.
Nas linhas 7 a 9 eu crio um novo SharedArray que irá retornar o JSON com os objetos (usuários).
Seguindo no mesmo arquivo nas linhas 23, 24 e 25 eu implemento as variáveis que posteriomente irei utilizar nas linhas 30 e 31 para realizar o login.  

- Groups
Importei no arquivo de testes tests/k6/script-performance.js na linha 3 e utilizei os groups nas linhas 30, 47 e 63.


Trabalho final para o curso de automação de testes na camada de API do professor Júlio de Lima.
