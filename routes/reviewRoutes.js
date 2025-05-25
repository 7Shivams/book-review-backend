import express from 'express';
import { addReview, updateReview, deleteReview } from '../controller/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/books/:id/reviews', authenticateUser, addReview);
router.put('/reviews/:id', authenticateUser, updateReview);
router.delete('/reviews/:id', authenticateUser, deleteReview);

export default router;

