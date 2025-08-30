import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  tags: string[];
  isPinned: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10,000 characters']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#ffffff',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Compound index for better query performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

// Text index for search functionality
noteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Pre-save middleware to ensure tags are unique
noteSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.filter(tag => tag.trim() !== ''))];
  }
  next();
});

// Static method to find notes by user with pagination
noteSchema.statics.findByUser = function(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .sort({ isPinned: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to search notes
noteSchema.statics.searchNotes = function(userId: string, query: string) {
  return this.find({
    userId,
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

export const Note = mongoose.model<INote>('Note', noteSchema);
