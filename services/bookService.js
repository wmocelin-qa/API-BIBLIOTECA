const books = require('../models/books');
let bookIdCounter = 1;

function addBook(title, author) {
  const book = { id: bookIdCounter++, title, author, available: true };
  books.push(book);
  return book;
}

function getAvailableBooks() {
  return books.filter(b => b.available);
}

function getBookById(id) {
  // Garante que o id seja comparado como número
  return books.find(b => Number(b.id) === Number(id));
}

function setBookAvailability(id, available) {
  const book = getBookById(id);
  if (book) book.available = available;
}

module.exports = { addBook, getAvailableBooks, getBookById, setBookAvailability, books };
