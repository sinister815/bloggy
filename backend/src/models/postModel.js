import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      default: '',
    },
    featuredImage: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
      required: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'general',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Text index for search
postSchema.index({ title: 'text', content: 'text', tags: 'text' })

export default mongoose.model('Post', postSchema)