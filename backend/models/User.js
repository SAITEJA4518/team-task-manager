import mongoose from 'mongoose';

// This is the rulebook of what a User profile must contain
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email!
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'], // A user can ONLY be an Admin or a Member
    default: 'Member',        // If they don't pick, they are a regular Member
  }
}, { timestamps: true }); // This automatically records when they signed up!

const User = mongoose.model('User', userSchema);
export default User;