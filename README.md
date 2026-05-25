# 📝 AI Article Generator

## Project Overview

**AI Article Generator** is a simple, modular content generation web app built with **LangChain.js** and **LangChain Expression Language (LCEL)** . It allows users to input a topic and receive a fully structured article, including:

* Headline
* Introduction
* Body
* Conclusion

The app combines a **React frontend** and a **Node.js + LangChain backend** using LCEL's `.pipe()` syntax to create a smooth content generation experience.

---

## How It Works

### Flow Summary

1. **User Input** : Enter a topic in the web UI.
2. **Processing (Backend)** :

* LCEL pipelines generate each article section in order.

1. **Output** : Display the complete article in the browser.

---

## Modifications by wildfirebill

The following changes were made to the original project:

### Backend (`backend/src/index.ts`)
- Replaced LangChain `ChatOpenAI` (Groq) with direct Ollama HTTP API calls
- Added `GET /models` endpoint to list available Ollama models
- `POST /generate-article` now accepts `model` and `baseUrl` from the request body
- Added SEO tags generation as a fifth article section
- Removed `dotenv`, `@langchain/core`, `@langchain/openai` dependencies

### Frontend (`frontend/src/App.tsx`)
- Added collapsible **Settings** panel with Ollama URL input and model picker
- Settings persist across page reloads via `localStorage`
- Added light/dark mode toggle with CSS custom properties
- Dashboard displays SEO tags as pill badges below the article
- Added error display for failed requests

### Frontend (`frontend/src/index.css`, `frontend/src/App.css`)
- Rewrote styles to use CSS custom properties for theme support
- Added dark theme variables under `[data-theme="dark"]`
- Added settings panel, tag pills, and theme toggle styles

### Root
- Added `README.md` with setup instructions and modification log
