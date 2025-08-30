import apiService from './api'
import { Note, CreateNoteData, UpdateNoteData, NotesResponse } from '../types'

class NotesService {
  async getNotes(page: number = 1, limit: number = 20, search?: string, tag?: string): Promise<Note[]> {
    const params: any = { page, limit }
    if (search) params.search = search
    if (tag) params.tag = tag

    const response = await apiService.get<{ data: NotesResponse }>('/notes', params)
    return response.data.notes
  }

  async getNote(id: string): Promise<Note> {
    const response = await apiService.get<{ data: { note: Note } }>(`/notes/${id}`)
    return response.data.note
  }

  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await apiService.post<{ data: { note: Note } }>('/notes', data)
    return response.data.note
  }

  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await apiService.put<{ data: { note: Note } }>(`/notes/${id}`, data)
    return response.data.note
  }

  async deleteNote(id: string): Promise<void> {
    return apiService.delete(`/notes/${id}`)
  }

  async deleteMultipleNotes(ids: string[]): Promise<void> {
    const params = { noteIds: ids.join(',') }
    return apiService.delete('/notes', params)
  }

  async togglePinNote(id: string): Promise<Note> {
    const response = await apiService.patch<{ data: { note: Note } }>(`/notes/${id}/pin`)
    return response.data.note
  }

  async getAllTags(): Promise<string[]> {
    const response = await apiService.get<{ data: { tags: string[] } }>('/notes/tags/all')
    return response.data.tags
  }

  async getSearchSuggestions(query: string): Promise<Note[]> {
    const response = await apiService.get<{ data: { suggestions: Note[] } }>('/notes/search/suggestions', { query })
    return response.data.suggestions
  }

  // Local storage fallback for offline functionality
  private getStorageKey(userId: string): string {
    return `notes_${userId}`
  }

  saveToLocalStorage(userId: string, notes: Note[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(notes))
    } catch (error) {
      console.error('Failed to save notes to local storage:', error)
    }
  }

  getFromLocalStorage(userId: string): Note[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId))
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load notes from local storage:', error)
      return []
    }
  }

  clearLocalStorage(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId))
    } catch (error) {
      console.error('Failed to clear local storage:', error)
    }
  }
}

export const notesService = new NotesService()
export default notesService
