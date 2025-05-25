import { pool } from '../server.js';

export const addReview = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    // We should have both a rating and comment 
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a rating and your thoughts about the book'
      });
    }

    // Keep ratings between 1-5 stars
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Ratings should be between 1 and 5 stars'
      });
    }

    // check if this book actually exists
    const bookQuery = 'SELECT id FROM books WHERE id = $1';
    const bookResult = await pool.query(bookQuery, [bookId]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oops! We couldn\'t find this book in our library'
      });
    }

    // Check if book has already been reviewed
    const existingReviewQuery = 'SELECT id FROM reviews WHERE user_id = $1 AND book_id = $2';
    const existingReview = await pool.query(existingReviewQuery, [userId, bookId]);

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Looks like you\'ve already shared your thoughts on this book! You can edit your existing review instead'
      });
    }

    // save your review!
    const insertQuery = `
      INSERT INTO reviews (book_id, user_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, rating, comment, created_at
    `;

    const result = await pool.query(insertQuery, [bookId, userId, rating, comment]);
    const newReview = result.rows[0];

    // Get your name 
    const userQuery = 'SELECT name FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    const userName = userResult.rows[0]?.name;

    res.status(201).json({
      success: true,
      message: 'Thanks for sharing your thoughts! Your review has been added',
      data: {
        id: newReview.id,
        book_id: bookId,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: newReview.created_at,
        reviewer_name: userName
      }
    });

  } catch (error) {
    console.error('Error in addReview:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while saving your review. Please try again!',
      error: error.message
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    // need both rating and comment 
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your updated rating and thoughts about the book'
      });
    }

    // Keep those ratings between 1-5 stars!
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Ratings should be between 1 and 5 stars'
      });
    }

    // find the review 
    const checkReviewQuery = `
      SELECT r.*, b.title as book_title 
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.id = $1
    `;
    const reviewResult = await pool.query(checkReviewQuery, [reviewId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hmm... We couldn\'t find that review. Maybe it was deleted?'
      });
    }

    const review = reviewResult.rows[0];
    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sorry! You can only edit your own reviews'
      });
    }

    // Timestamp to update your review
    const updateQuery = `
      UPDATE reviews 
      SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING id, rating, comment, created_at
    `;

    const result = await pool.query(updateQuery, [rating, comment, reviewId, userId]);
    const updatedReview = result.rows[0];

    // Get your name 
    const userQuery = 'SELECT name FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    const userName = userResult.rows[0]?.name;

    res.status(200).json({
      success: true,
      message: 'Your review has been updated! Thanks for keeping it current',
      data: {
        id: updatedReview.id,
        book_title: review.book_title,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        created_at: updatedReview.created_at,
        reviewer_name: userName
      }
    });

  } catch (error) {
    console.error('Error in updateReview:', error);
    res.status(500).json({
      success: false,
      message: 'Oops! Something went wrong while updating your review. Please try again!',
      error: error.message
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const userId = req.user.userId;

    // review exists and belongs to you
    const checkReviewQuery = `
      SELECT r.*, b.title as book_title 
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.id = $1
    `;
    const reviewResult = await pool.query(checkReviewQuery, [reviewId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'We couldn\'t find that review. It might have already been deleted'
      });
    }

    const review = reviewResult.rows[0];
    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Sorry! You can only delete your own reviews'
      });
    }

    // Delete the review
    const deleteQuery = 'DELETE FROM reviews WHERE id = $1 AND user_id = $2';
    await pool.query(deleteQuery, [reviewId, userId]);

    res.status(200).json({
      success: true,
      message: 'Your review has been deleted successfully',
      data: {
        id: reviewId,
        book_title: review.book_title
      }
    });

  } catch (error) {
    console.error('Error in deleteReview:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting your review. Please try again!',
      error: error.message
    });
  }
};
