const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post('/loans', authenticateJWT, loanController.borrowBook);
router.post('/returns', authenticateJWT, loanController.returnBook);
router.get('/myloans', authenticateJWT, loanController.myLoans);

module.exports = router;
