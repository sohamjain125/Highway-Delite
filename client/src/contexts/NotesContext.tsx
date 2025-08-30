import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { notesService } from '../services/notesService'
import { Note, CreateNoteData, UpdateNoteData } from '../types'

interface NotesContextType {
  notes: Note[]
  loading: boolean
  error: string | null
  fetchNotes: () => Promise<void>
  createNote: (data: CreateNoteData) => Promise<Note>
  updateNote: (id: string, data: UpdateNoteData) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
  deleteMultipleNotes: (ids: string[]) => Promise<void>
  togglePinNote: (id: string) => Promise<void>
  clearError: () => void
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}

interface NotesProviderProps {
  children: ReactNode
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedNotes = await notesService.getNotes()
      setNotes(fetchedNotes)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }, [])

  const createNote = useCallback(async (data: CreateNoteData): Promise<Note> => {
    try {
      setError(null)
      const newNote = await notesService.createNote(data)
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (error) {
      throw error
    }
  }, [])

  const updateNote = useCallback(async (id: string, data: UpdateNoteData): Promise<Note> => {
    try {
      setError(null)
      const updatedNote = await notesService.updateNote(id, data)
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
      return updatedNote
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note'
      setError(errorMessage)
      throw error
    }
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    try {
      setError(null)
      await notesService.deleteNote(id)
      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note'
      setError(errorMessage)
      throw error
    }
  }, [])

  const deleteMultipleNotes = useCallback(async (ids: string[]) => {
    try {
      setError(null)
      await notesService.deleteMultipleNotes(ids)
      setNotes(prev => prev.filter(note => !ids.includes(note.id)))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notes'
      setError(errorMessage)
      throw error
    }
  }, [])

  const togglePinNote = useCallback(async (id: string) => {
    try {
      setError(null)
      const updatedNote = await notesService.togglePinNote(id)
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle pin'
      setError(errorMessage)
      throw error
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: NotesContextType = {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    deleteMultipleNotes,
    togglePinNote,
    clearError
  }

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  )
}
