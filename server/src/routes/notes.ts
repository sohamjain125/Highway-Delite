import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { validate, noteValidation, noteUpdateValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { Note } from '../models/Note';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/notes
// @desc    Get all notes for authenticated user
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, tag } = req.query;
  const userId = req.user._id;

  let query: any = { userId };

  // Add search functionality
  if (search && typeof search === 'string') {
    query.$text = { $search: search };
  }

  // Add tag filter
  if (tag && typeof tag === 'string') {
    query.tags = { $in: [tag] };
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get notes with pagination
  const notes = await Note.find(query)
    .sort({ isPinned: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Note.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      notes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalNotes: total,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    }
  });
}));

// @route   GET /api/notes/:id
// @desc    Get a specific note by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, userId });
  
  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { note }
  });
}));

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', validate(noteValidation), asyncHandler(async (req, res) => {
  const { title, content, tags, color, isPinned } = req.body;
  const userId = req.user._id;

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

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', validate(noteUpdateValidation), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  // Remove userId from update data to prevent changing ownership
  delete updateData.userId;

  const note = await Note.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: { note }
  });
}));

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOneAndDelete({ _id: id, userId });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully'
  });
}));

// @route   DELETE /api/notes
// @desc    Delete multiple notes
// @access  Private
router.delete('/', asyncHandler(async (req, res) => {
  const { noteIds } = req.body;
  const userId = req.user._id;

  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Note IDs array is required'
    });
  }

  const result = await Note.deleteMany({
    _id: { $in: noteIds },
    userId
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'No notes found to delete'
    });
  }

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} note(s) deleted successfully`
  });
}));

// @route   PATCH /api/notes/:id/pin
// @desc    Toggle pin status of a note
// @access  Private
router.patch('/:id/pin', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, userId });
  
  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  note.isPinned = !note.isPinned;
  await note.save();

  res.status(200).json({
    success: true,
    message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
    data: { note }
  });
}));

// @route   GET /api/notes/tags/all
// @desc    Get all unique tags for authenticated user
// @access  Private
router.get('/tags/all', asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const tags = await Note.aggregate([
    { $match: { userId } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags' } },
    { $sort: { _id: 1 } }
  ]);

  const uniqueTags = tags.map(tag => tag._id).filter(tag => tag);

  res.status(200).json({
    success: true,
    data: { tags: uniqueTags }
  });
}));

// @route   GET /api/notes/search/suggestions
// @desc    Get search suggestions based on note content
// @access  Private
router.get('/search/suggestions', asyncHandler(async (req, res) => {
  const { query } = req.query;
  const userId = req.user._id;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
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

  res.status(200).json({
    success: true,
    data: { suggestions }
  });
}));

export default router;
