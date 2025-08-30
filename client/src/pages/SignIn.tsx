import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Mail, Smartphone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {  SignInEmailData, SignInOTPData } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import Logo from '../components/Logo'
import ImageWithFallback from '../components/ImageWithFallback'
import { getImagePath } from '../utils/imageUtils'

const SignIn: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const { signIn, verifyOTP, resendOTP } = useAuth()
  const navigate = useNavigate()

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors }
  } = useForm<SignInEmailData>()

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors }
  } = useForm<SignInOTPData>()

  const onSubmitEmail = async (data: SignInEmailData) => {
    try {
      setLoading(true)
      await signIn(data)
      setEmail(data.email)
      setStep('otp')
      toast.success('OTP sent to your email!')
      setResendCountdown(60)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitOTP = async (data: { otp: string }) => {
    try {
      setLoading(true)
      // Verify OTP and complete signin
      await verifyOTP({
        email: email,
        otp: data.otp
      })
      toast.success('Sign in successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setLoading(true)
      await resendOTP(email)
      toast.success('New OTP sent!')
      setResendCountdown(60)
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
            <h1 className="text-xl font-semibold">Sign in</h1>
          </div>
        </div>

                 <div className="p-6">
           <p className="text-gray-600 text-center mb-6">
             Please login to continue to your account
           </p>

           <form onSubmit={step === 'email' ? handleSubmitEmail(onSubmitEmail) : handleSubmitOTP(onSubmitOTP)} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Email
               </label>
               <div className="relative">
                 <input
                   type="email"
                   placeholder="jonas.kahnewald@gmail.com"
                   className="input-field pl-10"
                   {...registerEmail('email', {
                     required: 'Email is required',
                     pattern: {
                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                       message: 'Invalid email address'
                     }
                   })}
                 />
                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
               </div>
               {emailErrors.email && (
                 <p className="text-red-500 text-sm mt-1">{emailErrors.email.message}</p>
               )}
             </div>

             {step === 'email' ? (
               <div>
                 
               </div>
             ) : (
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
             )}

             <button
               type="submit"
               disabled={loading}
               className="btn-primary w-full py-3"
             >
               {loading ? <LoadingSpinner size="sm" /> : (step === 'email' ? 'Send OTP' : 'Verify OTP')}
             </button>
           </form>

           {step === 'otp' && (
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
           )}

           <div className="mt-6 text-center">
              Need an account ? {''}
             <Link to="/signup" className="text-primary-600 hover:text-primary-700">
               Create one
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
               <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
               <p className="text-gray-600">
                 Please login to continue to your account
               </p>
             </div>

            <form onSubmit={step === 'email' ? handleSubmitEmail(onSubmitEmail) : handleSubmitOTP(onSubmitOTP)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="jonas.kahnewald@gmail.com"
                    className="input-field pl-10"
                                      {...registerEmail('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {emailErrors.email && (
                <p className="text-red-500 text-sm mt-1">{emailErrors.email.message}</p>
              )}
              </div>

              {step === 'email' ? (
                <div>
                 
                </div>
              ) : (
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
                <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              </div>
              {otpErrors.otp && (
                <p className="text-red-500 text-sm mt-1">{otpErrors.otp.message}</p>
              )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? <LoadingSpinner size="sm" /> : (step === 'email' ? 'Send OTP' : 'Verify OTP')}
              </button>
            </form>

            {step === 'otp' && (
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
            )}

            

            <div className="mt-6 text-center">
              Need an account ? {''}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700">
                Create one
              </Link>
            </div>
          </div>
        </div>

                <div className="flex-1 relative overflow-hidden">
          <ImageWithFallback 
            src="right-column.png"
            alt="Highway Delite" 
            className="w-full h-full object-cover"
            onError={() => {
              console.error('Image failed to load');
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
            }}
          />
          {/* Debug info */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
            Image path: {getImagePath('right-column.png')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
