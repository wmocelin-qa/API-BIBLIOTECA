const loans = require('../models/loans');
let loanIdCounter = 1;

function createLoan(userId, bookId) {
  const loan = { id: loanIdCounter++, userId, bookId, returned: false };
  loans.push(loan);
  return loan;
}

function getLoansByUser(userId) {
  return loans.filter(l => l.userId === userId);
}

function returnLoan(loanId) {
  const loan = loans.find(l => l.id === loanId);
  if (loan) loan.returned = true;
}

module.exports = { createLoan, getLoansByUser, returnLoan, loans };
