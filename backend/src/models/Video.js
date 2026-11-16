import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: {
      type: String,
      default: '',
    },
    teacherEmail: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      default: '',
    },
    topic: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '0:00',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    likedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: { type: String },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    ratings: [ratingSchema],
    views: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for seamless compatibility with existing frontend code
videoSchema.virtual('video_title').get(function () {
  return this.title;
});
videoSchema.virtual('video_description').get(function () {
  return this.description;
});
videoSchema.virtual('VideoURL').get(function () {
  return this.videoUrl;
});
videoSchema.virtual('ThumbnailURL').get(function () {
  return this.thumbnailUrl;
});
videoSchema.virtual('user_id').get(function () {
  return this.teacher;
});
videoSchema.virtual('like_count').get(function () {
  return this.likeCount;
});
videoSchema.virtual('average_rating').get(function () {
  return this.averageRating;
});
videoSchema.virtual('total_ratings').get(function () {
  return this.ratings;
});
videoSchema.virtual('upload_date').get(function () {
  return this.createdAt;
});
videoSchema.virtual('uploadDate').get(function () {
  return this.createdAt;
});
videoSchema.virtual('thumbnail').get(function () {
  return this.thumbnailUrl;
});
videoSchema.virtual('likes').get(function () {
  return this.likeCount;
});

const Video = mongoose.model('Video', videoSchema);
export default Video;
