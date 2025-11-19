// backend/routes/jobs.routes.js
import express from 'express';
import { searchJobs, recommendJobsForResume } from '../services/remotive.js';
const router = express.Router();

/**
 * GET /api/jobs?query=react&category=software-dev
 * returns array of jobs
 */
router.get('/', async (req, res, next) => {
  try {
    const { query = '', category = '' } = req.query;
    const jobs = await searchJobs(query, category);
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs/recommend/:resumeId
 * returns jobs recommended for a stored resume
 */
router.get('/recommend/:resumeId', async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { limit = 10 } = req.query;
    const result = await recommendJobsForResume(resumeId, Number(limit));
    // result now has { debug, jobs }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
