import Resume from '../models/Resume.js';
import { parsePDF } from '../services/resumeParser.js';

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const parsed = await parsePDF(req.file.path);
    const saved = await Resume.create({
      userId: req.user?.id || null,
      filename: req.file.filename,
      originalname: req.file.originalname,
      parsed: { text: parsed.text, skills: parsed.skills, wordCount: parsed.wordCount }
    });
    res.json({
      resumeId: saved._id.toString(),
      skills: saved.parsed.skills,
      snippet: (saved.parsed.text || '').slice(0, 300)
    });
  } catch (err) { next(err); }
};

export const getResume = async (req, res, next) => {
  try {
    const r = await Resume.findById(req.params.id).lean();
    if (!r) return res.status(404).json({ error: 'not found' });
    res.json({
      resumeId: r._id.toString(),
      filename: r.filename,
      originalname: r.originalname,
      skills: r.parsed.skills,
      snippet: (r.parsed.text || '').slice(0, 300)
    });
  } catch (err) { next(err); }
};
