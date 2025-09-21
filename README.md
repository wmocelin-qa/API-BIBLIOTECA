# API Biblioteca

API REST para gerenciamento de biblioteca, desenvolvida em Node.js com Express. Permite cadastro e login de usuários, consulta de livros disponíveis, empréstimo e devolução de livros, além de consulta dos empréstimos do usuário.

## Instalação

1. Clone o repositório ou copie os arquivos para seu ambiente.
2. Instale as dependências:
   ```bash
   npm install express body-parser jsonwebtoken swagger-ui-express
   ```

## Executando a API

- Para iniciar o servidor:
  ```bash
  node server.js
  ```
- O servidor será iniciado na porta 3000 por padrão.

## Endpoints

- `POST /api/register` - Cadastro de usuário
- `POST /api/login` - Login de usuário (retorna JWT)
- `GET /api/books` - Consulta livros disponíveis
- `POST /api/loans` - Realizar empréstimo de livro (requer Bearer Token)
- `POST /api/returns` - Devolução de livro (requer Bearer Token)
- `GET /api/myloans` - Consultar meus empréstimos (requer Bearer Token)
- `GET /api-docs` - Documentação Swagger

## Autenticação

- Para empréstimos, devolução e consulta de empréstimos, inclua o token JWT no header:
  ```
  Authorization: Bearer <seu_token>
  ```

## Documentação Swagger

Acesse `/api-docs` para visualizar e testar os endpoints via Swagger UI.

## Observações
- O banco de dados é em memória, os dados são perdidos ao reiniciar o servidor.
- Não é permitido cadastrar usuários nulos, em branco ou duplicados.
- Só é possível reservar livros disponíveis.
- O projeto está estruturado em controllers, services, models, routes, app.js e server.js.

---
Trabalho final para o curso de automação de testes na camada de API do professor Júlio de Lima.
