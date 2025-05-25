import express from 'express';
import { getAllBooks, addBook, getBookById, searchBooks } from '../controller/bookController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/getAllBooks', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);
router.post('/addBook', authenticateUser, addBook);

export default router;
