import naturalPkg from 'natural';
const { TfIdf, WordTokenizer } = naturalPkg;

// returns array of { jobId, title, score, matchedTokens }
export function matchTextWithJobs(resumeText, jobs) {
  const tokenizer = new WordTokenizer();

  return jobs.map(job => {
    const combined = `${job.title || ''} ${job.description || ''}`;
    const tfidf = new TfIdf();
    tfidf.addDocument(resumeText || '');
    tfidf.addDocument(combined);

    const v0 = {};
    tfidf.listTerms(0).forEach(t => v0[t.term] = t.tfidf);
    const v1 = {};
    tfidf.listTerms(1).forEach(t => v1[t.term] = t.tfidf);

    const dot = (a, b) => Object.keys(a).reduce((s, k) => s + (a[k] || 0) * (b[k] || 0), 0);
    const mag = v => Math.sqrt(Object.values(v).reduce((s, x) => s + x * x, 0));
    const denominator = mag(v0) * mag(v1);
    const cos = denominator ? dot(v0, v1) / denominator : 0;
    const score = Math.round(cos * 10000) / 100; // percent with 2 decimals

    const t0 = tokenizer.tokenize((resumeText || '').toLowerCase());
    const t1 = tokenizer.tokenize(combined.toLowerCase());
    const matched = [...new Set(t0.filter(t => t1.includes(t)))].slice(0, 30);

    return {
      jobId: job.jobId || null,
      title: job.title || '',
      score,
      matchedTokens: matched
    };
  });
}
