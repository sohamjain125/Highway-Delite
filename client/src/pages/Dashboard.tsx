import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotes } from '../contexts/NotesContext'
import { Note, CreateNoteData } from '../types'
import { Plus, Search, Trash2, Pin, Edit, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import CreateNoteModal from '../components/CreateNoteModal'
import EditNoteModal from '../components/EditNoteModal'

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const { notes, loading, fetchNotes, createNote, deleteNote, togglePinNote } = useNotes()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleCreateNote = async (data: CreateNoteData) => {
    try {
      await createNote(data)
      setShowCreateModal(false)
      toast.success('Note created successfully!')
    } catch (error) {
      toast.error('Failed to create note')
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setShowEditModal(true)
  }

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id)
        toast.success('Note deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete note')
      }
    }
  }

  const handleTogglePin = async (id: string) => {
    try {
      await togglePinNote(id)
      toast.success('Note pin status updated!')
    } catch (error) {
      toast.error('Failed to update pin status')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully!')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const pinnedNotes = filteredNotes.filter(note => note.isPinned)
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned)

  const handleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedNotes.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedNotes.length} note(s)?`)) {
      try {
        await Promise.all(selectedNotes.map(id => deleteNote(id)))
        setSelectedNotes([])
        toast.success(`${selectedNotes.length} note(s) deleted successfully!`)
      } catch (error) {
        toast.error('Failed to delete some notes')
      }
    }
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
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Sign Out
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-gray-600 text-sm">
              Email: {user?.email}
            </p>
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create new note</span>
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {selectedNotes.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">
                  {selectedNotes.length} note(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedNotes([])}
                    className="text-gray-600 hover:text-gray-700 text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
              </div>
            ) : (
              <>
                {pinnedNotes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Pin className="w-4 h-4 mr-1" />
                      Pinned
                    </h4>
                    {pinnedNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isSelected={selectedNotes.includes(note.id)}
                        onSelect={handleNoteSelection}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                )}

                {unpinnedNotes.length > 0 && (
                  <div className="space-y-2">
                    {pinnedNotes.length > 0 && (
                      <h4 className="text-sm font-medium text-gray-700">Others</h4>
                    )}
                    {unpinnedNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isSelected={selectedNotes.includes(note.id)}
                        onSelect={handleNoteSelection}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="desktop-header">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              HD
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Sign Out
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-gray-600">
              Email: {user?.email}
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-6 py-3 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create new note</span>
            </button>

            <div className="relative w-80">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {selectedNotes.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">
                  {selectedNotes.length} note(s) selected
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedNotes([])}
                    className="text-gray-600 hover:text-gray-700 text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {searchQuery ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
              </div>
            ) : (
              <>
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isSelected={selectedNotes.includes(note.id)}
                    onSelect={handleNoteSelection}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                  />
                ))}
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isSelected={selectedNotes.includes(note.id)}
                    onSelect={handleNoteSelection}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateNote}
      />

      <EditNoteModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        note={editingNote}
      />
    </div>
  )
}

interface NoteCardProps {
  note: Note
  isSelected: boolean
  onSelect: (noteId: string) => void
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
  onTogglePin: (noteId: string) => void
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onTogglePin
}) => {
  return (
    <div 
      className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
      }`}
      onClick={() => onSelect(note.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect(note.id)
            }}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {note.title}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin(note.id)
            }}
            className={`p-1 rounded hover:bg-gray-100 ${
              note.isPinned ? 'text-yellow-600' : 'text-gray-400'
            }`}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(note)
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
        {note.content}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}

export default Dashboard
