import { useState, useEffect } from 'react';
import './App.css';

type Article = {
  headline: string;
  intro: string;
  body: string;
  conclusion: string;
  tags: string[];
};

type OllamaModel = {
  name: string;
};

const BACKEND_URL = 'http://localhost:5000';

function App() {
  const [topic, setTopic] = useState('');
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const [ollamaUrl, setOllamaUrl] = useState(
    () => localStorage.getItem('ollamaUrl') || 'http://localhost:11434'
  );
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem('ollamaModel') || ''
  );
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('ollamaUrl', ollamaUrl);
  }, [ollamaUrl]);

  useEffect(() => {
    localStorage.setItem('ollamaModel', selectedModel);
  }, [selectedModel]);

  const fetchModels = async () => {
    setFetchingModels(true);
    setError('');
    try {
      const res = await fetch(
        `${BACKEND_URL}/models?baseUrl=${encodeURIComponent(ollamaUrl)}`
      );
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      setAvailableModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0].name);
      }
    } catch {
      setError('Could not connect to Ollama at ' + ollamaUrl);
    } finally {
      setFetchingModels(false);
    }
  };

  useEffect(() => {
    if (showSettings) {
      fetchModels();
    }
  }, [showSettings]);

  const generateArticle = async () => {
    setLoading(true);
    setError('');
    setArticle(null);
    const model = selectedModel || 'llama3.2';
    try {
      const res = await fetch(`${BACKEND_URL}/generate-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, model, baseUrl: ollamaUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setArticle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="settings-bar">
        <button
          className="theme-toggle"
          onClick={() => setDark(!dark)}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? '☀️' : '🌙'}
        </button>
        <button
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? '▼' : '⚙'} Settings
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <label className="settings-label">
            Ollama URL
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="settings-input"
            />
          </label>

          <div className="model-row">
            <label className="settings-label">
              Model
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="settings-select"
              >
                {availableModels.length === 0 && (
                  <option value="">No models found</option>
                )}
                {availableModels.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="refresh-btn"
              onClick={fetchModels}
              disabled={fetchingModels}
            >
              {fetchingModels ? '...' : '↻'}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </div>
      )}

      <h1 className="header">AI Article Generator</h1>

      <input
        type="text"
        placeholder="Enter a topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="input-field"
      />

      <button
        onClick={generateArticle}
        disabled={loading || !topic}
        className={`generate-btn ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {article && (
        <div className="article">
          <h2 className="article-headline">{article.headline}</h2>
          <p>
            <strong>Intro:</strong> {article.intro}
          </p>
          <p>
            <strong>Body:</strong> {article.body}
          </p>
          <p>
            <strong>Conclusion:</strong> {article.conclusion}
          </p>
          {article.tags && article.tags.length > 0 && (
            <div className="tags-section">
              <strong>Tags:</strong>
              <div className="tags-list">
                {article.tags.map((tag, i) => (
                  <span key={i} className="tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
