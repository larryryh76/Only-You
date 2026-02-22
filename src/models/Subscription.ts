import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['cashapp', 'crypto'] },
  paymentProof: { type: String }, // Transaction ID or note
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
