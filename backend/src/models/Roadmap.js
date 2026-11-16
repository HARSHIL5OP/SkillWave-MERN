import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'Learning Roadmap',
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
    },
    duration: {
      type: String,
      default: '4 weeks',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    roadmap: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    completedSteps: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
