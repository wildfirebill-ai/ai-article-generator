import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const ollamaGenerate = async (
  prompt: string,
  model: string,
  baseUrl: string
): Promise<string> => {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.response;
};

// AI steps
const generateHeadline = async (
  topic: string,
  model: string,
  baseUrl: string
): Promise<string> => {
  const text = await ollamaGenerate(
    `Generate a catchy headline for: ${topic}. Return only the headline, no extra text.`,
    model,
    baseUrl
  );
  const match = text.match(/[""](.*?)[""]/);
  return match?.[1] || text.split('\n')[0];
};

const generateIntro = async (
  headline: string,
  model: string,
  baseUrl: string
): Promise<string> => {
  return ollamaGenerate(
    `Write an engaging introduction for: "${headline}"`,
    model,
    baseUrl
  );
};

const generateBody = async (
  intro: string,
  model: string,
  baseUrl: string
): Promise<string> => {
  return ollamaGenerate(
    `Write a detailed body expanding on: ${intro}`,
    model,
    baseUrl
  );
};

const generateConclusion = async (
  body: string,
  model: string,
  baseUrl: string
): Promise<string> => {
  return ollamaGenerate(
    `Write a conclusion for this: ${body}`,
    model,
    baseUrl
  );
};

const generateTags = async (
  headline: string,
  intro: string,
  body: string,
  model: string,
  baseUrl: string
): Promise<string[]> => {
  const text = await ollamaGenerate(
    `Generate 5-10 SEO-optimized tags/keywords for an article with the following headline, intro, and body. Return ONLY a comma-separated list of tags, no numbering, no extra text.\n\nHeadline: ${headline}\n\nIntro: ${intro}\n\nBody: ${body}`,
    model,
    baseUrl
  );
  return text
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter((t) => t.length > 0);
};

// Orchestrate full article
const generateArticle = async (
  topic: string,
  model: string,
  baseUrl: string
) => {
  const headline = await generateHeadline(topic, model, baseUrl);
  const intro = await generateIntro(headline, model, baseUrl);
  const body = await generateBody(intro, model, baseUrl);
  const conclusion = await generateConclusion(body, model, baseUrl);
  const tags = await generateTags(headline, intro, body, model, baseUrl);
  return { headline, intro, body, conclusion, tags };
};

// List models from Ollama
app.get('/models', async (_req, res) => {
  const baseUrl = _req.query.baseUrl as string || 'http://localhost:11434';
  try {
    const ollamaRes = await fetch(`${baseUrl}/api/tags`);
    if (!ollamaRes.ok) {
      return res.status(502).json({ error: 'Failed to reach Ollama' });
    }
    const data = await ollamaRes.json();
    const models = (data.models || []).map((m: any) => ({
      name: m.name,
      size: m.size,
      modified: m.modified_at,
    }));
    res.json(models);
  } catch (err) {
    res.status(502).json({ error: 'Cannot connect to Ollama' });
  }
});

// Generate article
app.post('/generate-article', async (req, res) => {
  const { topic, model, baseUrl } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const ollamaModel = model || 'llama3.2';
  const ollamaUrl = baseUrl || 'http://localhost:11434';

  try {
    const article = await generateArticle(topic, ollamaModel, ollamaUrl);
    res.json(article);
  } catch (err) {
    console.error('Error generating article:', err);
    res.status(500).json({ error: 'Failed to generate article.' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
