import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    problemStatementUrl: {
      type: String,
      required: [true, 'Problem statement URL is required'],
    },
    solutionUrl: {
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
      default: 'General',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for compatibility
challengeSchema.virtual('content_title').get(function () {
  return this.title;
});
challengeSchema.virtual('content_description').get(function () {
  return this.description;
});
challengeSchema.virtual('problemStatementURL').get(function () {
  return this.problemStatementUrl;
});
challengeSchema.virtual('solutionURL').get(function () {
  return this.solutionUrl;
});
challengeSchema.virtual('user_id').get(function () {
  return this.teacher;
});
challengeSchema.virtual('upload_date').get(function () {
  return this.createdAt;
});

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
