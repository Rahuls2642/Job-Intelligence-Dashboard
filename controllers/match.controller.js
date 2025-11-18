import { matchTextWithJobs } from '../services/matcher.js';
import Resume from '../models/Resume.js';

export const matchController = async (req, res, next) => {
  try {
    const { resumeId, resumeText, jobs } = req.body;
    if (!Array.isArray(jobs) || jobs.length === 0) return res.status(400).json({ error: 'jobs array required' });

    let baseText = resumeText || '';
    if (resumeId) {
      const r = await Resume.findById(resumeId).lean();
      if (!r) return res.status(404).json({ error: 'resume not found' });
      baseText = r.parsed.text || '';
    }

    const results = matchTextWithJobs(baseText, jobs);
    res.json({ matches: results });
  } catch (err) { next(err); }
};
