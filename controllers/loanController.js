const loanService = require('../services/loanService');
const bookService = require('../services/bookService');

function borrowBook(req, res) {
  const bookId = Number(req.body.bookId);
  
  try {
    // Tentar adquirir lock para evitar race condition
    if (!bookService.acquireLock(bookId)) {
      // Se não conseguiu o lock, livro está sendo processado - retornar 409 (Conflict)
      return res.status(409).json({ error: 'Livro está sendo processado, tente novamente' });
    }

    try {
      const userId = req.userId;
      const book = bookService.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }
      
      if (book.availableCopies <= 0) {
        return res.status(400).json({ error: 'Livro não disponível para empréstimo' });
      }

      // Decrementar cópias disponíveis
      bookService.decreaseAvailableCopies(bookId);
      
      // Criar empréstimo
      const loan = loanService.createLoan(userId, bookId);
      
      res.status(201).json({ 
        message: 'Empréstimo realizado', 
        loanId: loan.id, 
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          availableCopies: book.availableCopies
        }
      });
    } finally {
      // SEMPRE liberar o lock, mesmo em caso de erro
      bookService.releaseLock(bookId);
    }
  } catch (err) {
    bookService.releaseLock(bookId);
    res.status(500).json({ error: err.message || 'Erro ao realizar empréstimo' });
  }
}

function returnBook(req, res) {
  try {
    const userId = req.userId;
    const { loanId } = req.body;
    
    // Validar se loanId foi fornecido
    if (!loanId) {
      return res.status(400).json({ error: 'loanId é obrigatório' });
    }
    
    const numericLoanId = Number(loanId);
    const loan = loanService.loans.find(l => Number(l.id) === numericLoanId && l.userId === userId && !l.returned);
    
    if (!loan) {
      return res.status(400).json({ error: 'Empréstimo não encontrado ou já devolvido' });
    }

    // Adquirir lock do livro para garantir atomicidade
    const bookId = loan.bookId;
    if (!bookService.acquireLock(bookId)) {
      return res.status(409).json({ error: 'Livro está sendo processado, tente novamente' });
    }

    try {
      loanService.returnLoan(numericLoanId);
      bookService.increaseAvailableCopies(bookId);
      
      return res.status(200).json({ message: 'Livro devolvido com sucesso' });
    } finally {
      bookService.releaseLock(bookId);
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro ao devolver livro' });
  }
}

function myLoans(req, res) {
  try {
    const userId = req.userId;
    const loans = loanService.getLoansByUser(userId);
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro ao buscar empréstimos' });
  }
}

module.exports = { borrowBook, returnBook, myLoans };