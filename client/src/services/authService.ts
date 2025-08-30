import apiService from './api'
import { AuthResponse, User, SignUpData, OTPData, SignInEmailData } from '../types'

class AuthService {
  async signUp(data: SignUpData): Promise<void> {
    return apiService.post('/auth/signup', data)
  }

  async verifyOTP(data: OTPData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/verify-otp', data)
    return response
  }

  async signIn(data: SignInEmailData): Promise<void> {
    // For passwordless auth, signIn just sends OTP, doesn't return token/user
    return apiService.post('/auth/signin', data)
  }

  async signOut(): Promise<void> {
    return apiService.post('/auth/signout')
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ success: boolean; user: User }>('/auth/me')
    return response.user
  }

  async resendOTP(email: string): Promise<void> {
    return apiService.post('/auth/resend-otp', { email })
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
