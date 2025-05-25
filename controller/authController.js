import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../model/userModel.js';

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // we have all the required info
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all fields: name, email, and password'
      });
    }

    // Check if someone already using this email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Want to login instead?'
      });
    }

    // Create a password and new account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await createUser(email, hashedPassword, name);

    // Generate their login token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Welcome to our book community! Your account has been created',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({
      success: false,
      message: 'Oops! Something went wrong while creating your account. Please try again!',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ask both email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email and password'
      });
    }

    // Find the user account
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'We couldn\'t find an account with that email. Need to sign up?'
      });
    }

    // Check the password 
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again!'
      });
    }

    // Generate their new login token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Welcome back! You\'re now logged in',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry! We had trouble logging you in. Please try again!',
      error: error.message
    });
  }
};
