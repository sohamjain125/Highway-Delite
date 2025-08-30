import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Mail, User, Calendar, Smartphone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SignUpData, OTPData } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import Logo from '../components/Logo'

const SignUp: React.FC = () => {
  const [step, setStep] = useState<'signup' | 'otp'>('signup')
  const [signupData, setSignupData] = useState<SignUpData | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const { signUp, verifyOTP, resendOTP } = useAuth()
  const navigate = useNavigate()

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: signUpErrors },
  } = useForm<SignUpData>()

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors }
  } = useForm<OTPData>()

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
      setResendCountdown(60) // Start 60 second countdown
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Countdown effect
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  // Start countdown when OTP step is shown
  React.useEffect(() => {
    if (step === 'otp') {
      setResendCountdown(60)
    }
  }, [step])



  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Layout */}
        <div className="block md:hidden relative">
          {/* Mobile Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
            style={{
              backgroundImage: 'url(/right-column.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onError={() => {
              console.error('Background image failed to load');
            }}
          />
          <div className="relative z-10">
          <div className="mobile-status-bar">
            <span className="time">9:41</span>
            <div className="icons">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>
          
          <div className="mobile-header">
            <div className="flex items-center space-x-3">
              <Logo width={40} height={16} />
              <h1 className="text-xl font-semibold">Sign up</h1>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 text-center mb-6">
              Sign up to enjoy the feature of HD
            </p>

                         <form onSubmit={handleSubmitOTP(onSubmitOTP)} className="space-y-4">
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
                    {...registerOTP('otp', {
                      required: 'OTP is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'OTP must be 6 digits'
                      }
                    })}
                  />
                  <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {otpErrors.otp && (
                  <p className="text-red-500 text-sm mt-1">{otpErrors.otp.message}</p>
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
                disabled={loading || resendCountdown > 0}
                className={`text-sm ${
                  resendCountdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-primary-600 hover:text-primary-700'
                }`}
              >
                {resendCountdown > 0 
                  ? `Resend OTP in ${resendCountdown}s` 
                  : 'Resend OTP'
                }
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/signin" className="text-primary-600 hover:text-primary-700">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex min-h-screen">
          {/* Logo at top-left */}
          <div className="absolute top-8 left-8 z-20">
            <Logo width={64} height={26} />
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="text-left mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
                <p className="text-gray-600">
                  Sign up to enjoy the features of Highway Delite
                </p>
              </div>

                             <form onSubmit={handleSubmitOTP(onSubmitOTP)} className="space-y-4">
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
                       {...registerOTP('otp', {
                         required: 'OTP is required',
                         pattern: {
                           value: /^\d{6}$/,
                           message: 'OTP must be 6 digits'
                         }
                       })}
                     />
                     <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                   </div>
                   {otpErrors.otp && (
                     <p className="text-red-500 text-sm mt-1">{otpErrors.otp.message}</p>
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
                  disabled={loading || resendCountdown > 0}
                  className={`text-sm ${
                    resendCountdown > 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-primary-600 hover:text-primary-700'
                  }`}
                >
                  {resendCountdown > 0 
                    ? `Resend OTP in ${resendCountdown}s` 
                    : 'Resend OTP'
                  }
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link to="/signin" className="text-primary-600 hover:text-primary-700">
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <img 
              src="/right-column.png" 
              alt="Highway Delite" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="block md:hidden relative">

        <div className="relative z-10">
        <div className="mobile-status-bar">
          <span className="time">9:41</span>
          <div className="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
        
        <div className="mobile-header">
          <div className="flex items-center space-x-3">
            <Logo width={40} height={16} />
            <h1 className="text-xl font-semibold">Sign up</h1>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            Sign up to enjoy the features of Highway Delite
          </p>

                       <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Jonas Kahnewald"
                  className="input-field pl-10"
                  {...registerSignUp('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {signUpErrors.name && (
                <p className="text-red-500 text-sm mt-1">{signUpErrors.name.message}</p>
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
                  {...registerSignUp('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {signUpErrors.email && (
                <p className="text-red-500 text-sm mt-1">{signUpErrors.email.message}</p>
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
                  {...registerSignUp('dateOfBirth')}
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



          <div className="mt-6 text-center">
            <Link to="/signin" className="text-primary-600 hover:text-primary-700">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
        </div>
      </div>

             {/* Desktop Layout */}
       <div className="hidden md:flex min-h-screen">
         <div className="flex-1 flex items-center justify-center p-8">
                      <div className="w-full max-w-md">
             <div className="text-left mb-8">
               <div className="mb-4">
                 <Logo width={64} height={26} />
               </div>
               <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
               <p className="text-gray-600">
                 Sign up to enjoy the features of Highway Delite
               </p>
             </div>

             <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Jonas Kahnewald"
                    className="input-field pl-10"
                    {...registerSignUp('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {signUpErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.name.message}</p>
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
                    {...registerSignUp('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {signUpErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.email.message}</p>
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
                    {...registerSignUp('dateOfBirth')}
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



            <div className="mt-6 text-center">
              <Link to="/signin" className="text-primary-600 hover:text-primary-700">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <img 
            src="/right-column.png" 
            alt="Highway Delite" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log('Image loaded successfully')}
          />
        </div>
      </div>
    </div>
  )
}

export default SignUp
