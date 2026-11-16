import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      default: '',
    },
    reply: {
      type: String,
      required: true,
      trim: true,
    },
    isTeacher: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    likes: {
      type: [String],
      default: [],
    },
    hasReplies: {
      type: Boolean,
      default: false,
    },
    replies: [replySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias for timestamp
commentSchema.virtual('timestamp').get(function () {
  return this.createdAt;
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
