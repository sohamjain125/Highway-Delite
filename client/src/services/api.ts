import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { ApiResponse } from '../types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token')
          window.location.href = '/signin'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.api.get<T>(url, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.patch<T>(url, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const response = error.response
      if (response?.data?.message) {
        return new Error(response.data.message)
      }
      if (response?.data?.errors && Array.isArray(response.data.errors)) {
        const errorMessages = response.data.errors.map((e: any) => e.message).join(', ')
        return new Error(errorMessages)
      }
      if (response?.status === 404) {
        return new Error('Resource not found')
      }
      if (response?.status === 500) {
        return new Error('Internal server error')
      }
      if (response?.status === 0 || !response) {
        return new Error('Network error. Please check your connection.')
      }
      return new Error(`Request failed with status ${response?.status}`)
    }
    return new Error(error.message || 'An unexpected error occurred')
  }
}

export const apiService = new ApiService()
export default apiService
