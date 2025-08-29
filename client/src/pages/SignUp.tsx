import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, User, Calendar, Smartphone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SignUpData } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'signup' | 'otp'>('signup')
  const [signupData, setSignupData] = useState<SignUpData | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp, verifyOTP, resendOTP } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<SignUpData>()

  const onSubmitSignUp = async (data: SignUpData) => {
    try {
      setLoading(true)
      await signUp(data)
      setSignupData(data)
      setStep('otp')
      toast.success('OTP sent to your email!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitOTP = async (data: { otp: string }) => {
    if (!signupData) return

    try {
      setLoading(true)
      await verifyOTP({
        email: signupData.email,
        otp: data.otp
      })
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!signupData) return

    try {
      setLoading(true)
      await resendOTP(signupData.email)
      toast.success('New OTP sent!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    // Redirect to Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="mobile-status-bar">
            <span className="time">9:41</span>
            <div className="icons">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>
          
          <div className="mobile-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                HD
              </div>
              <h1 className="text-xl font-semibold">Sign up</h1>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 text-center mb-6">
              Sign up to enjoy the feature of HD
            </p>

            <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{signupData?.name}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{signupData?.email}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <p className="text-gray-900">{signupData?.dateOfBirth}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="input-field pr-10"
                    {...register('otp', {
                      required: 'OTP is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'OTP must be 6 digits'
                      }
                    })}
                  />
                  <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Resend OTP
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/signin" className="text-primary-600 hover:text-primary-700">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex min-h-screen">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  HD
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
                <p className="text-gray-600">
                  Sign up to enjoy the feature of HD
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{signupData?.name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{signupData?.email}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <p className="text-gray-900">{signupData?.dateOfBirth}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="input-field pr-10"
                      {...register('otp', {
                        required: 'OTP is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'OTP must be 6 digits'
                        }
                      })}
                    />
                    <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Sign up'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Resend OTP
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link to="/signin" className="text-primary-600 hover:text-primary-700">
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-primary-800 to-primary-900 wavy-bg flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Welcome to Highway Delite</h2>
              <p className="text-xl text-primary-100">
                Your personal space for capturing thoughts and ideas
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="mobile-status-bar">
          <span className="time">9:41</span>
          <div className="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
        
        <div className="mobile-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              HD
            </div>
            <h1 className="text-xl font-semibold">Sign up</h1>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            Sign up to enjoy the feature of HD
          </p>

          <form onSubmit={handleSubmit(onSubmitSignUp)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Jonas Kahnewald"
                  className="input-field pl-10"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="jonas.kahnewald@gmail.com"
                  className="input-field pl-10"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="input-field pl-10"
                  {...register('dateOfBirth')}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Get OTP'}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/signin" className="text-primary-600 hover:text-primary-700">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                HD
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
              <p className="text-gray-600">
                Sign up to enjoy the feature of HD
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitSignUp)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Jonas Kahnewald"
                    className="input-field pl-10"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="jonas.kahnewald@gmail.com"
                    className="input-field pl-10"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="input-field pl-10"
                    {...register('dateOfBirth')}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Get OTP'}
              </button>
            </form>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignUp}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/signin" className="text-primary-600 hover:text-primary-700">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gradient-to-br from-primary-800 to-primary-900 wavy-bg flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Welcome to Highway Delite</h2>
            <p className="text-xl text-primary-100">
              Your personal space for capturing thoughts and ideas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
