
const bookService = require('../services/bookService');

function listAvailableBooks(req, res) {
  const books = bookService.getAvailableBooks();
  res.json(books);
}

function addBook(req, res) {
  const { title, author } = req.body;
  if (!title || !author || title.trim() === '' || author.trim() === '') {
    return res.status(400).json({ error: 'Título e autor são obrigatórios' });
  }
  const book = bookService.addBook(title, author);
  res.status(201).json({ message: 'Livro cadastrado com sucesso', book });
}

module.exports = { listAvailableBooks, addBook };
