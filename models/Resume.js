
import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  parsed: {
    text: { type: String, default: '' },
    skills: { type: [String], default: [] },
    wordCount: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

ResumeSchema.index({ 'parsed.skills': 1 });

export default mongoose.model('Resume', ResumeSchema);
