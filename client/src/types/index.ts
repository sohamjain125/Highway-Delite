export interface User {
  id: string
  name: string
  email: string
  dateOfBirth?: string
  avatar?: string
  isEmailVerified: boolean
  authMethod: 'email' | 'google'
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  userId: string
  tags: string[]
  isPinned: boolean
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteData {
  title: string
  content: string
  tags?: string[]
  color?: string
  isPinned?: boolean
}

export interface UpdateNoteData {
  title?: string
  content?: string
  tags?: string[]
  color?: string
  isPinned?: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{
    field: string
    message: string
    value?: any
  }>
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalNotes: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface NotesResponse {
  notes: Note[]
  pagination: PaginationInfo
}

export interface SignUpData {
  name: string
  email: string
  dateOfBirth?: string
}

export interface OTPData {
  email: string
  otp: string
}

export interface SignInData {
  email: string
  password: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'date' | 'tel'
  placeholder: string
  required: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    message?: string
  }
}

export interface ValidationError {
  field: string
  message: string
}

export interface LoadingState {
  isLoading: boolean
  message?: string
}

export interface ErrorState {
  hasError: boolean
  message?: string
  field?: string
}
