import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const errorMessage = searchParams.get('message')

    if (errorMessage) {
      setError(errorMessage)
      setTimeout(() => {
        navigate('/signin')
      }, 3000)
      return
    }

    if (token) {
      // Store the token and redirect to dashboard
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } else {
      setError('No authentication token received')
      setTimeout(() => {
        navigate('/signin')
      }, 3000)
    }
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to sign in page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LoadingSpinner size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Completing Authentication</h1>
        <p className="text-gray-600">Please wait while we complete your sign in...</p>
      </div>
    </div>
  )
}

export default AuthCallback
