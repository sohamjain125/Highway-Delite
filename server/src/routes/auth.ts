import express, { Request, Response } from 'express';
import passport from 'passport';
import { User, IUser } from '../models/User';
import { authenticateToken, generateToken } from '../middleware/auth';
import { validate, signupValidation, otpValidation, signinValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';

const router = express.Router();

// Signup route
router.post('/signup', validate(signupValidation), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, dateOfBirth } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
    return;
  }

  // Create new user (passwordless)
  const user = new User({
    name,
    email,
    dateOfBirth,
    authMethod: 'email'
  });

  await user.save();

  // Generate and send OTP
  const otp = (user as any).generateOTP();
  await user.save();

  try {
    await emailService.sendOTP(email, otp, name);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'OTP sent to your email address',
    userId: user._id
  });
}));

// Verify OTP route
router.post('/verify-otp', validate(otpValidation), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  if (!(user as any).verifyOTP(otp)) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
    return;
  }

  // Mark email as verified and clear OTP
  user.isEmailVerified = true;
  (user as any).clearOTP();
  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail the verification if welcome email fails
  }

  // Generate JWT token
  const token = generateToken((user as any)._id.toString());

  res.json({
    success: true,
    message: 'Email verified successfully',
    token,
    user: {
      id: (user as any)._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  });
}));

// Signin route (Passwordless - sends OTP)
router.post('/signin', validate(signinValidation), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User not found. Please sign up first.'
    });
    return;
  }

  // Check if user signed up with Google
  if (user.authMethod === 'google') {
    res.status(400).json({
      success: false,
      message: 'Please sign in with Google'
    });
    return;
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    res.status(400).json({
      success: false,
      message: 'Please verify your email address first'
    });
    return;
  }

  // Generate and send OTP for signin
  const otp = (user as any).generateOTP();
  await user.save();

  try {
    await emailService.sendOTP(email, otp, user.name);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
    return;
  }

  res.json({
    success: true,
    message: 'OTP sent to your email address'
  });
}));

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user as IUser;
    const token = generateToken((user as any)._id.toString());

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  })
);

// Signout route
router.post('/signout', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // In a stateless JWT setup, the client is responsible for removing the token
  // This endpoint can be used for logging purposes or future token blacklisting
  res.json({
    success: true,
    message: 'Sign out successful'
  });
}));

// Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  
  res.json({
    success: true,
    user: {
      id: (user as any)._id,
      name: (user as any).name,
      email: (user as any).email,
      dateOfBirth: (user as any).dateOfBirth,
      avatar: (user as any).avatar,
      authMethod: (user as any).authMethod
    }
  });
}));

// Resend OTP route
router.post('/resend-otp', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
    return;
  }

  if (user.isEmailVerified) {
    res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
    return;
  }

  // Generate new OTP
  const otp = (user as any).generateOTP();
  await user.save();

  try {
    await emailService.sendOTP(user.email, otp, user.name);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
    return;
  }

  res.json({
    success: true,
      message: 'OTP resent successfully'
  });
}));

export default router;
