import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const SECRET = process.env.JWT_SECRET || 'dev_secret';

export default async function auth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash').lean();
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}
