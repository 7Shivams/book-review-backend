import express from "express";
import dotenv from "dotenv";
import pg from "pg";
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

export const pool = new pg.Pool({
  database: process.env.PSQL_DB_NAME,
  user: process.env.PSQL_DB_USER,
  host: process.env.PSQL_DB_HOST,
  password: process.env.PSQL_DB_PASSWORD,
  port: process.env.PSQL_DB_PORT
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to PostgreSQL database');
  });
});

const app = express();
app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('/api/auth', authRoutes);   
app.use('/api/books', bookRoutes);  
app.use('/api', reviewRoutes);

const PORT = process.env.PORT || 8080;

pool.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });
