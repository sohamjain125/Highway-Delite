import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  dateOfBirth?: Date;
  googleId?: string;
  avatar?: string;
  isEmailVerified: boolean;
  authMethod: 'email' | 'google';
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: false, // Password is optional for passwordless auth
    minlength: [6, 'Password must be at least 6 characters long']
  },
  dateOfBirth: {
    type: Date,
    required: function() { return this.authMethod === 'email'; },
    validate: {
      validator: function(value: Date) {
        if (!value) return true;
        const today = new Date();
        let age = today.getFullYear() - value.getFullYear();
        const monthDiff = today.getMonth() - value.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) {
          age--;
        }
        
        return age >= 13;
      },
      message: 'You must be at least 13 years old to register'
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  authMethod: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.otp;
      delete ret.otpExpiry;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ authMethod: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp: string): boolean {
  if (!this.otp || !this.otpExpiry) return false;
  if (new Date() > this.otpExpiry) return false;
  return this.otp === otp;
};

// Method to clear OTP
userSchema.methods.clearOTP = function(): void {
  this.otp = undefined;
  this.otpExpiry = undefined;
};

export const User = mongoose.model<IUser>('User', userSchema);
