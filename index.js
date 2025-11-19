// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import resumesRoutes from './routes/resumes.routes.js';
import matchRoutes from './routes/match.routes.js';
import jobRoutes from './routes/jobs.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(
  { origin: 'http://localhost:5173' }
));


// db connect
(async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    // routes
    app.use('/api/auth', authRoutes);
    app.use('/api/resumes', resumesRoutes);
    app.use('/api/match', matchRoutes);
    app.use('/api/jobs', jobRoutes);
    
    // health
    app.get('/', (req, res) => {
      res.json({ ok: true, message: "Backend is running" });
    });

    // error handler
    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(err.status || 500).json({ error: err.message || "Server error" });
    });

    // start server
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
})();
