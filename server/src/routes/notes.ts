import express, { Request, Response } from 'express';
import { Note, INote } from '../models/Note';
import { authenticateToken } from '../middleware/auth';
import { validate, noteValidation, noteUpdateValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all notes for the authenticated user
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const tag = req.query.tag as string;

  let query: any = { userId };

  // Add search functionality
  if (search) {
    query.$text = { $search: search };
  }

  // Add tag filter
  if (tag) {
    query.tags = tag;
  }

  const skip = (page - 1) * limit;
  
  const notes = await Note.find(query)
    .sort({ isPinned: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Note.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
}));

// Get a specific note
router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const noteId = req.params.id;

  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    res.status(404).json({
      success: false,
      message: 'Note not found'
    });
    return;
  }

  res.json({
    success: true,
    data: { note }
  });
}));

// Create a new note
router.post('/', validate(noteValidation), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const { title, content, tags, color, isPinned } = req.body;

  const note = new Note({
    title,
    content,
    userId,
    tags: tags || [],
    color: color || '#ffffff',
    isPinned: isPinned || false
  });

  await note.save();

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: { note }
  });
}));

// Update a note
router.put('/:id', validate(noteUpdateValidation), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const noteId = req.params.id;
  const { title, content, tags, color, isPinned } = req.body;

  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    res.status(404).json({
      success: false,
      message: 'Note not found'
    });
    return;
  }

  // Update fields
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (color !== undefined) note.color = color;
  if (isPinned !== undefined) note.isPinned = isPinned;

  await note.save();

  res.json({
    success: true,
    message: 'Note updated successfully',
    data: { note }
  });
}));

// Delete a note
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const noteId = req.params.id;

  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  if (!note) {
    res.status(404).json({
      success: false,
      message: 'Note not found'
    });
    return;
  }

  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
}));

// Delete multiple notes
router.delete('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const { noteIds } = req.body;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Note IDs array is required'
    });
    return;
  }

  const result = await Note.deleteMany({
    _id: { $in: noteIds },
    userId
  });

  res.json({
    success: true,
    message: `${result.deletedCount} notes deleted successfully`
  });
}));

// Toggle pin status
router.patch('/:id/pin', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const noteId = req.params.id;

  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    res.status(404).json({
      success: false,
      message: 'Note not found'
    });
    return;
  }

  note.isPinned = !note.isPinned;
  await note.save();

  res.json({
    success: true,
    message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
    data: { note }
  });
}));

// Get all unique tags for the user
router.get('/tags/all', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;

  const tags = await Note.distinct('tags', { userId });
  const filteredTags = tags.filter(tag => tag && tag.trim() !== '');

  res.json({
    success: true,
    data: { tags: filteredTags }
  });
}));

// Get search suggestions
router.get('/search/suggestions', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as any)._id;
  const query = req.query.q as string;

  if (!query || query.trim().length < 2) {
    res.json({
      success: true,
      data: { suggestions: [] }
    });
    return;
  }

  const suggestions = await Note.find({
    userId,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  })
  .select('title tags')
  .limit(5);

  res.json({
    success: true,
    data: { suggestions }
  });
}));

export default router;
