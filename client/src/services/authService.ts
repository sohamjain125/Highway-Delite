import apiService from './api'
import { AuthResponse, User, SignUpData, OTPData, SignInData } from '../types'

class AuthService {
  async signUp(data: SignUpData): Promise<void> {
    return apiService.post('/auth/signup', data)
  }

  async verifyOTP(data: OTPData): Promise<AuthResponse> {
    const response = await apiService.post<{ data: AuthResponse }>('/auth/verify-otp', data)
    return response.data
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await apiService.post<{ data: AuthResponse }>('/auth/signin', data)
    return response.data
  }

  async signOut(): Promise<void> {
    return apiService.post('/auth/signout')
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ data: { user: User } }>('/auth/me')
    return response.data.user
  }

  async resendOTP(email: string): Promise<void> {
    return apiService.post('/auth/resend-otp', { email })
  }

  // Google OAuth
  initiateGoogleAuth(): void {
    const googleAuthUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
    window.location.href = googleAuthUrl
  }

  // Handle Google OAuth callback
  handleGoogleCallback(token: string): AuthResponse {
    // Store token and return user data
    localStorage.setItem('token', token)
    
    // For now, we'll need to fetch user data separately
    // In a real implementation, the callback might include user data
    return {
      token,
      user: {
        id: '',
        name: '',
        email: '',
        isEmailVerified: true,
        authMethod: 'google',
        createdAt: new Date().toISOString()
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token')
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem('token')
  }
}

export const authService = new AuthService()
export default authService
