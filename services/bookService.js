const books = require('../models/books');
let bookIdCounter = 1;

// Sistema de locks em memória para evitar race conditions
const locks = {};

function acquireLock(bookId) {
  if (locks[bookId]) {
    return false;
  }
  locks[bookId] = true;
  return true;
}

function releaseLock(bookId) {
  delete locks[bookId];
}

function addBook(title, author) {
  const book = { id: bookIdCounter++, title, author, totalCopies: 1, availableCopies: 1 };
  books.push(book);
  return book;
}

function getAvailableBooks() {
  return books.filter(b => b.availableCopies > 0);
}

function getBookById(id) {
  // Garante que o id seja comparado como número
  return books.find(b => Number(b.id) === Number(id));
}

function decreaseAvailableCopies(id) {
  const book = getBookById(id);
  if (book && book.availableCopies > 0) {
    book.availableCopies--;
    return true;
  }
  return false;
}

function increaseAvailableCopies(id) {
  const book = getBookById(id);
  if (book && book.availableCopies < book.totalCopies) {
    book.availableCopies++;
    return true;
  }
  return false;
}

// Mantido para compatibilidade (deprecated)
function setBookAvailability(id, available) {
  const book = getBookById(id);
  if (book) {
    if (available) {
      book.availableCopies = book.totalCopies;
    } else {
      book.availableCopies = 0;
    }
  }
}

module.exports = { 
  addBook, 
  getAvailableBooks, 
  getBookById, 
  setBookAvailability,
  decreaseAvailableCopies,
  increaseAvailableCopies,
  acquireLock,
  releaseLock,
  books 
};
