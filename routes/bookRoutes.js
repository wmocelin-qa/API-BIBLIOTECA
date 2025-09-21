const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/books', bookController.listAvailableBooks);
router.post('/books', bookController.addBook);

module.exports = router;
