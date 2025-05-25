import { pool } from '../server.js';

export const addBook = async (req, res) => {
  try {
    const { title, author, genre } = req.body;

    // book details to add it to our library
    if (!title || !author || !genre) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the book\'s title, author, and genre'
      });
    }

    const query = `
      INSERT INTO books (title, author, genre, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id, title, author, genre, created_at
    `;

    const result = await pool.query(query, [title, author, genre]);
    const newBook = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Great! The book has been added to our library',
      data: newBook
    });

  } catch (error) {
    console.error('Error in addBook:', error);
    res.status(500).json({
      success: false,
      message: 'Oops! Something went wrong while adding the book. Please try again!',
      error: error.message
    });
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 2, author, genre } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = [];
    let values = [];
    let paramCount = 1;
    
    if (author) {
      whereClause.push(`author ILIKE $${paramCount}`);
      values.push(`%${author}%`);
      paramCount++;
    }
    
    if (genre) {
      whereClause.push(`genre ILIKE $${paramCount}`);
      values.push(`%${genre}%`);
      paramCount++;
    }
    
    const whereStatement = whereClause.length > 0 
      ? 'WHERE ' + whereClause.join(' AND ')
      : '';

    const countQuery = `
      SELECT COUNT(*) 
      FROM books 
      ${whereStatement}
    `;
    const totalCount = await pool.query(countQuery, values);
    
    const query = `
      SELECT * 
      FROM books 
      ${whereStatement}
      ORDER BY id ASC 
      LIMIT $${paramCount} 
      OFFSET $${paramCount + 1}
    `;
    
    const finalValues = [...values, limit, offset];
    const books = await pool.query(query, finalValues);

    return res.status(200).json({
      success: true,
      data: books.rows,
      pagination: {
        total: parseInt(totalCount.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount.rows[0].count / limit)
      },
      message: "Here are all the books in our collection!"
    });

  } catch (error) {
    console.error("Error in getAllBooks:", error);
    res.status(500).json({ 
      success: false, 
      message: "Sorry! We're having trouble fetching the books right now. Please try again later.", 
      error: error.message 
    });
    next(error);
  }
};

export const getBookById = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    // Get book details 
    const bookQuery = `
      SELECT 
        b.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE b.id = $1
      GROUP BY b.id
    `;

    const bookResult = await pool.query(bookQuery, [bookId]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sorry! We couldn\'t find that book in our library'
      });
    }

    // Fetch the reviews with names
    const reviewsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const reviewsResult = await pool.query(reviewsQuery, [bookId, limit, offset]);

    const book = bookResult.rows[0];
    res.status(200).json({
      success: true,
      data: {
        id: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        created_at: book.created_at,
        average_rating: parseFloat(book.average_rating).toFixed(1),
        total_reviews: parseInt(book.total_reviews),
        reviews: {
          items: reviewsResult.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(book.total_reviews),
            totalPages: Math.ceil(book.total_reviews / limit)
          }
        }
      },
      message: "Here's everything about the book, including what other readers think!"
    });

  } catch (error) {
    console.error('Error in getBookById:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry! We had trouble getting the book details. Please try again!',
      error: error.message
    });
  }
};

export const searchBooks = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please enter something to search for - a title or author name works great!'
      });
    }

    const searchQuery = `
      SELECT 
        b.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews
      FROM books b
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE 
        LOWER(b.title) LIKE LOWER($1) OR 
        LOWER(b.author) LIKE LOWER($1)
      GROUP BY b.id
      ORDER BY 
        CASE 
          WHEN LOWER(b.title) LIKE LOWER($2) THEN 0   -- Best match: exact title
          WHEN LOWER(b.author) LIKE LOWER($2) THEN 1  -- Next best: exact author
          ELSE 2                                      -- Partial matches
        END,
        b.title ASC
      LIMIT $3 OFFSET $4
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT b.id) 
      FROM books b
      WHERE 
        LOWER(b.title) LIKE LOWER($1) OR 
        LOWER(b.author) LIKE LOWER($1)
    `;

    const searchPattern = `%${query}%`;
    const exactPattern = query.toLowerCase();

    const [searchResult, countResult] = await Promise.all([
      pool.query(searchQuery, [searchPattern, exactPattern, limit, offset]),
      pool.query(countQuery, [searchPattern])
    ]);

    const books = searchResult.rows.map(book => ({
      ...book,
      average_rating: parseFloat(book.average_rating).toFixed(1)
    }));

    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      message: total > 0 
        ? "Here's what we found for you!" 
        : "We couldn't find any books matching your search. Try different keywords!",
      data: {
        books,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in searchBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry! Something went wrong with the search. Please try again!',
      error: error.message
    });
  }
};
