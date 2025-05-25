import { pool } from '../server.js';

export const createUser = async (email, hashedPassword, name) => {
  const query = `
    INSERT INTO users (email, password, name, created_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING id, email, name, created_at
  `;
  
  try {
    const result = await pool.query(query, [email, hashedPassword, name]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { 
      throw new Error('Email already exists');
    }
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};
