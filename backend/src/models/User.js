import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const preferenceSchema = new mongoose.Schema(
  {
    category: { type: String, default: '' },
    subcategory: { type: String, default: '' },
    currentSkills: { type: [String], default: [] },
    wantToLearn: { type: [String], default: [] },
    futureGoals: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['learner', 'teacher', 'admin'],
      default: 'learner',
    },
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Inactive'],
      default: 'Active',
    },
    preferences: {
      type: preferenceSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Encrypt password using bcrypt before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
