import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    registrationClosingDate: {
      type: Date,
    },
    organizedBy: {
      type: String,
      default: 'SkillWave',
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online',
    },
    location: {
      type: String,
      default: 'Online',
    },
    eventType: {
      type: String,
      enum: ['Workshop', 'Conference', 'Webinar', 'Hackathon', 'General'],
      default: 'Workshop',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizerName: {
      type: String,
      default: '',
    },
    organizerEmail: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active',
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases
eventSchema.virtual('event_title').get(function () {
  return this.title;
});
eventSchema.virtual('event_description').get(function () {
  return this.description;
});
eventSchema.virtual('thumbnailURL').get(function () {
  return this.thumbnailUrl;
});
eventSchema.virtual('pdfURL').get(function () {
  return this.pdfUrl;
});
eventSchema.virtual('event_date').get(function () {
  return this.eventDate;
});
eventSchema.virtual('event_type').get(function () {
  return this.eventType;
});
eventSchema.virtual('user_id').get(function () {
  return this.organizer;
});
eventSchema.virtual('upload_date').get(function () {
  return this.createdAt;
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
