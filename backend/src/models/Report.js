import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Dismissed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
