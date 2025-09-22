const bookService = require('../services/bookService');
const loanService = require('../services/loanService');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const SECRET = 'biblioteca_secret';

// BOA PRÁTICA: Importar as classes de erro específicas do Apollo.
const { UserInputError, AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    // Retorna todos os livros disponíveis
    availableBooks: async () => {
      try {
        return await bookService.getAvailableBooks();
      } catch (err) {
        console.error(err); // Logar o erro no servidor é importante
        throw new Error('Ocorreu um erro interno ao listar os livros.');
      }
    },
    // Retorna os empréstimos do usuário autenticado
    myLoans: async (parent, args, context) => {
      try {
        // BOA PRÁTICA: Verificar autenticação no início do resolver.
        if (!context.user) {
          throw new AuthenticationError('Você precisa estar logado para ver seus empréstimos.');
        }
        return await loanService.getLoansByUser(context.user.userId);
      } catch (err) {
        console.error(err);
        // Se for um erro que já lançamos (como AuthenticationError), relança. Senão, lança um genérico.
        throw err instanceof UserInputError || err instanceof AuthenticationError ? err : new Error('Ocorreu um erro interno ao buscar seus empréstimos.');
      }
    },
    // Retorna todos os usuários (geralmente uma rota protegida para admins)
    users: async () => {
      try {
        return await userService.getAllUsers(); // Supondo que o nome do método seja este
      } catch (err) {
        console.error(err);
        throw new Error('Ocorreu um erro interno ao listar os usuários.');
      }
    },
  },
  Mutation: {
    // Realiza o login de um usuário
    login: async (parent, { username, password }) => {
      const user = await userService.findUserByUsername(username);
      
      // BOA PRÁTICA: Usar UserInputError para falhas de validação.
      if (!user || !(await userService.comparePassword(password, user.password))) {
        throw new UserInputError('Usuário ou senha inválidos.');
      }
      
      const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });
      return { token, user };
    },
    // Registra um novo usuário
    register: async (parent, { username, password }) => {
      try {
        return await userService.createUser(username, password);
      } catch (err) {
         // Exemplo: se o erro for de "usuário já existe"
        if (err.code === 'USER_EXISTS') { // Supondo um código de erro customizado no seu service
          throw new UserInputError('Este nome de usuário já está em uso.');
        }
        console.error(err);
        throw new Error('Ocorreu um erro interno ao registrar o usuário.');
      }
    },
    // Realiza o empréstimo de um livro
    borrowBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Você precisa estar logado para realizar um empréstimo.');
      }

      const book = await bookService.getBookById(bookId);

      // BOA PRÁTICA: Usar UserInputError para regras de negócio que falham.
      if (!book || !book.available) {
        throw new UserInputError('Livro não encontrado ou não está disponível para empréstimo.');
      }

      await bookService.setBookAvailability(bookId, false);
      const loan = await loanService.createLoan(context.user.userId, bookId);
      
      return {
        ...loan,
        message: 'Empréstimo realizado com sucesso!'
      };
    },
    // Realiza a devolução de um livro
    returnBook: async (parent, { loanId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Você precisa estar logado para devolver um livro.');
      }
      
      const loan = await loanService.findActiveLoanById(loanId, context.user.userId);
      
      if (!loan) {
        throw new UserInputError('Empréstimo não encontrado, pertence a outro usuário ou já foi devolvido.');
      }

      await loanService.returnLoan(loanId);
      await bookService.setBookAvailability(loan.bookId, true);
      
      return { ...loan, returned: true }; // Retorna o empréstimo atualizado
    },
    // Adiciona um novo livro
    addBook: async (parent, { title, author }) => {
      if (!title || !author || title.trim() === '' || author.trim() === '') {
        throw new UserInputError('Título e autor são obrigatórios.');
      }
      return await bookService.addBook(title, author);
    },
  },
  // Resolvers para campos de tipos complexos
  Loan: {
    book: async (loan) => await bookService.getBookById(loan.bookId),
    user: async (loan) => await userService.getUserById(loan.userId),
  },
};

module.exports = resolvers;