const loanService = require('../services/loanService');
const bookService = require('../services/bookService');

function borrowBook(req, res) {
  try {
    const userId = req.userId;
    const { bookId } = req.body;
    const book = bookService.getBookById(bookId);
    if (!book || !book.available) {
      return res.status(400).json({ error: 'Livro não disponível para empréstimo' });
    }
    bookService.setBookAvailability(bookId, false);
    const loan = loanService.createLoan(userId, bookId);
    res.status(201).json({ message: 'Empréstimo realizado', book });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erro ao realizar empréstimo' });
  }
}

function returnBook(req, res) {
  try {
    const userId = req.userId;
    const { loanId } = req.body;
    const loan = loanService.loans.find(l => l.id === loanId && l.userId === userId && !l.returned);
    if (!loan) {
      return res.status(400).json({ error: 'Empréstimo não encontrado ou já devolvido' });
    }
    loanService.returnLoan(loanId);
    bookService.setBookAvailability(loan.bookId, true);
    return res.status(200).json({ message: 'Livro devolvido com sucesso' });
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