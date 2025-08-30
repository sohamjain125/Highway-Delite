import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

if (googleClientId && googleClientSecret && googleCallbackUrl) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email but different auth method
      user = await User.findOne({ email: profile.emails?.[0]?.value });
      
      if (user) {
        // Update existing user with Google ID
        user.googleId = profile.id;
        user.authMethod = 'google';
        user.isEmailVerified = true;
        user.avatar = profile.photos?.[0]?.value;
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = new User({
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
        authMethod: 'google',
        isEmailVerified: true
      });

      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
} else {
  console.warn('⚠️  Google OAuth credentials not configured. Google sign-in will be disabled.');
}

export default passport;
