Insightlytics-chatbot
=====================

A lightweight React + Vite frontend that helps users query, summarize, and generate product reviews using scraped product data and language models (local or remote). It's intended for developers and data enthusiasts who want a UI to experiment with LLM-based product analysis and simple scraping/text-to-SQL flows.



https://github.com/user-attachments/assets/eb0dfc08-14a6-4cf0-88bf-2821973e22f3




Purpose
-------

The main purpose of this project is to deliver realistic, multi-perspective product reviews and real user experiences so prospective buyers can gain a comprehensive view of a product. By aggregating scraped product information, user feedback, and model-generated summaries, the application helps users weigh pros and cons, understand common usage patterns, and make more informed purchasing decisions.

For businesses and product teams, the project can be used to surface actionable customer-experience insights: what the product does well, recurring issues or feature gaps, and signals that inform product improvement, roadmap planning, and market analysis.


Prerequisites
-------------

Before you continue, ensure you meet the following requirements:

* Node.js (LTS) installed (recommended: 16, 18 or 20).
* npm (or yarn) installed and available on your PATH.
* Basic familiarity with running commands in PowerShell on Windows.
* (Optional) Local or remote services, depending on your workflow:
  * A local LLM or remote LLM provider (OpenAI, Gemini) if you plan to use model calls directly.
  * A scraping service or backend API for fetching product data (see `SCRAPE_API_URL` / `API_URL`).
  * Supabase / PostgreSQL if you want to persist or query scraped data.

Installation
------------

Follow these numbered steps to set up the project locally on Windows (PowerShell):

1. Clone the repository and change into the project folder:

```powershell
git clone <repo-url>
cd tiki_product_reviewer
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in the project root (copy from `.env.example` if available). At a minimum set the following variables (see next section for details):

```text
API_URL=http://localhost:8000
SCRAPE_API_URL=http://localhost:5000
LOCAL_LLM_URL=http://localhost:11434/api/tags
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
SUPABASE_URL=... 
SUPABASE_API_KEY=...
```

4. Start the development server:

```powershell
npm run dev
```

5. Open the app in your browser (default Vite port):

http://localhost:5173

Usage
-----

After installation and starting the dev server, use the web UI to submit questions or review-generation requests about products. The app uses components in `src/components/` (for example `AskForm.jsx`, `ChatInput.jsx`, `ModelSelector.jsx`) and calls endpoints in `src/api/` to reach backend services or LLMs.

Common developer checks
* Health of backend API (PowerShell):

```powershell
Invoke-RestMethod -Uri "$env:API_URL/health" -Method Get
```

* Health of local LLM endpoint (PowerShell):

```powershell
Invoke-RestMethod -Uri "$env:LOCAL_LLM_URL" -Method Get
```

Package scripts
---------------

The `package.json` in this project includes the following scripts (run in project root):

* `npm run dev` — start Vite development server
* `npm run build` — build production assets
* `npm run preview` — preview production build locally

Environment variables (summary)
-------------------------------

This project reads runtime configuration from environment variables (see the `.env` file in the repo root). The most important variables are:

* `LOCAL_LLM_URL` — URL to local LLM endpoint 
* `OPENAI_API_KEY`
* `GEMINI_API_KEY`
* `SUPABASE_URL`
* `SUPABASE_API_KEY` 
* `DATABASE_URL` or `user,password,host,port,dbname` — direct Postgres connection string or individual DB params (optional).
* `API_URL` — backend API server base URL 
* `SCRAPE_API_URL` — scraping service base URL 

Security note: The repository's `.env` should never contain real production keys when pushed to a public repo. Use `.env.local`, secret managers, or CI/CD secrets and rotate keys if they were exposed.


How it works (high-level)
-------------------------

1. User submits a question or request via the UI.
2. Frontend calls the backend endpoints in `src/api/` or directly calls the configured LLM endpoint.
3. Backend may call scraping services, run text-to-SQL conversions, query a database, and call the chosen LLM provider.
4. The response is returned and rendered in the chat UI.

Contributing
------------

If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-change`.
3. Implement tests (if you add logic) and make small, focused commits.
4. Push your branch and open a pull request describing the change.

If you expect many contributors, add a `CONTRIBUTING.md` with coding standards, commit message style, branch/PR process, and code review checklist.


