import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  username: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  subscriptionPrice: { type: Number, default: 0 },
  profileImage: { type: String },
  coverImage: { type: String },
  bio: { type: String },
  displayFollowerCount: { type: Number, default: 0 },
  paymentDetails: {
    cashapp: { type: String },
    crypto: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
