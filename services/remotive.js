
import fetch from 'node-fetch';
import Resume from '../models/Resume.js';

const REMOTIVE_BASE = 'https://remotive.com/api/remote-jobs';


const memCache = new Map();
const MEM_TTL = 1000 * 60 * 5;
function getFromMemCache(key) {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > MEM_TTL) { memCache.delete(key); return null; }
  return entry.data;
}
function setMemCache(key, data) { memCache.set(key, { ts: Date.now(), data }); }

export async function searchJobs(query = '', category = '') {
  const q = (query || '').trim();
  const cacheKey = `search:${q}:${category}`;
  const fromMem = getFromMemCache(cacheKey);
  if (fromMem) return fromMem;

  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (category) params.set('category', category);

  const url = `${REMOTIVE_BASE}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remotive error ${res.status}: ${text}`);
  }
  const json = await res.json();
  const jobs = Array.isArray(json.jobs) ? json.jobs : [];
  const normalized = jobs.map(j => ({
    jobId: j.id || j.slug || `${j.company_name}_${j.title}`.replace(/\s+/g, '_'),
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location,
    url: j.url,
    salary: j.salary,
    category: j.category,
    description: j.description,
    publication_date: j.publication_date
  }));
  setMemCache(cacheKey, normalized);
  return normalized;
}


export async function recommendJobsForResume(resumeId, limit = 10) {
  
  const resume = await Resume.findById(resumeId).lean();
  if (!resume) throw new Error('Resume not found');


  const resumeSkills = Array.isArray(resume.parsed?.skills) ? resume.parsed.skills : [];
  const resumeText = (resume.parsed?.text || '') + ' ' + resumeSkills.join(' ');
  const tokens = resumeSkills.length ? resumeSkills : (resumeText ? resumeText.split(/\s+/).slice(0,10) : []);
  const searchStr = tokens.slice(0, 3).join(' ').trim() || (resumeText.slice(0, 100) || '').trim();

  console.log('[recommend] resumeId:', resumeId);
  console.log('[recommend] resumeSkills:', resumeSkills);
  console.log('[recommend] derived tokens:', tokens);
  console.log('[recommend] initial searchStr:', JSON.stringify(searchStr).slice(0,200));

  let jobs = [];
  try {
    if (searchStr) jobs = await searchJobs(searchStr);
    console.log(`[recommend] searchJobs returned ${jobs.length} jobs for "${searchStr}"`);
  } catch (err) {
    console.error('[recommend] searchJobs error:', err.message);
    jobs = [];
  }

 
  if (!jobs.length) {
    const fallbackQueries = ['developer','engineer','full stack','frontend','backend'];
    for (const q of fallbackQueries) {
      try {
        const j = await searchJobs(q);
        if (j && j.length) {
          jobs = j;
          console.log(`[recommend] fallback query "${q}" returned ${j.length} jobs — breaking fallback loop`);
          break;
        }
      } catch (e) {
        console.warn('[recommend] fallback query error', e.message);
      }
    }
  }


  function scoreJob(job) {
    const hay = `${job.title} ${job.description} ${job.company}`.toLowerCase();
    let score = 0;
    for (const t of tokens) if (hay.includes(String(t).toLowerCase())) score += 1;
    return score;
  }

  const scored = jobs.map(j => ({ ...j, score: scoreJob(j) }));
  scored.sort((a,b) => b.score - a.score);

  console.log('[recommend] scored jobs count:', scored.length);
  
  return {
    debug: {
      resumeId,
      tokens,
      initialSearchStr: searchStr,
      jobsFetched: jobs.length
    },
    jobs: scored.slice(0, limit)
  };
}
