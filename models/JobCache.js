
import mongoose from 'mongoose';
const JobCacheSchema = new mongoose.Schema({
  jobId: { type: String, index: true, unique: true },
  title: String,
  company: String,
  location: String,
  url: String,
  description: String,
  category: String,
  fetchedAt: { type: Date, default: Date.now }
});
export default mongoose.model('JobCache', JobCacheSchema);
