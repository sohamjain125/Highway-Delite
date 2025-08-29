import express from 'express';
import passport from 'passport';
import { authenticateToken, generateToken } from '../middleware/auth';
import { validate, signupValidation, otpValidation, signinValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { User } from '../models/User';
import { sendOTP } from '../services/emailService';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register new user and send OTP
// @access  Public
router.post('/signup', validate(signupValidation), asyncHandler(async (req, res) => {
  const { name, email, dateOfBirth } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user with OTP
  const user = new User({
    name,
    email,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    authMethod: 'email'
  });

  // Generate and send OTP
  const otp = user.generateOTP();
  await user.save();

  // Send OTP via email
  try {
    await sendOTP(email, otp, name);
  } catch (error) {
    // If email fails, delete user and return error
    await User.findByIdAndDelete(user._id);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }

  res.status(201).json({
    success: true,
    message: 'OTP sent to your email. Please check and verify.',
    data: {
      userId: user._id,
      email: user.email,
      name: user.name
    }
  });
}));

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration
// @access  Public
router.post('/verify-otp', validate(otpValidation), asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify OTP
  if (!user.verifyOTP(otp)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  // Set password (using OTP as password for now)
  user.password = otp;
  user.isEmailVerified = true;
  user.clearOTP();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id.toString());

  res.status(200).json({
    success: true,
    message: 'Account created successfully',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    }
  });
}));

// @route   POST /api/auth/signin
// @desc    Authenticate user and return token
// @access  Public
router.post('/signin', validate(signinValidation), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user has password (email auth method)
  if (user.authMethod === 'email' && !user.password) {
    return res.status(401).json({
      success: false,
      message: 'Please sign up first'
    });
  }

  // Verify password
  if (user.authMethod === 'email') {
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  }

  // Generate JWT token
  const token = generateToken(user._id.toString());

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        authMethod: user.authMethod
      }
    }
  });
}));

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  asyncHandler(async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Google authentication failed'
        });
      }

      // Generate JWT token
      const token = generateToken(user._id.toString());

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
    }
  })
);

// @route   POST /api/auth/signout
// @desc    Sign out user
// @access  Private
router.post('/signout', authenticateToken, asyncHandler(async (req, res) => {
  // In a stateless JWT system, the client just needs to remove the token
  // But we can add any cleanup logic here if needed
  
  res.status(200).json({
    success: true,
    message: 'Signed out successfully'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        authMethod: user.authMethod,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to user's email
// @access  Public
router.post('/resend-otp', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'User not found'
    });
  }

  // Generate new OTP
  const otp = user.generateOTP();
  await user.save();

  // Send new OTP
  try {
    await sendOTP(email, otp, user.name);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'New OTP sent to your email'
  });
}));

export default router;
