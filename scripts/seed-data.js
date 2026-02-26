
const mongoose = require('mongoose');

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

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  const uri = process.argv[2];
  if (!uri) throw new Error("No URI provided");

  await mongoose.connect(uri);

  await User.create({
    name: "Kate Joh",
    email: "kate@example.com",
    password: "password123", // not hashed but doesn't matter for public view
    role: "creator",
    username: "katejoh",
    isVerified: true,
    subscriptionPrice: 4.99,
    bio: "Available now 🦋 🌸",
    displayFollowerCount: 20,
    profileImage: "/logo.jpg", // placeholder
    coverImage: "/logo.jpg", // placeholder
  });

  console.log("Creator created");
  await mongoose.disconnect();
}

run().catch(console.error);
