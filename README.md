# ProofLab

ProofLab is a visual reasoning debugger for algebra, introductory polynomial calculus, and complex numbers. Rather than marking a learner wrong, it identifies the first transition that changes the mathematical claim and shows concrete evidence.

## Run locally

Install the frontend and start Next.js:

```bash
npm install
npm run dev
```

Start the single FastAPI backend in a second terminal:

```bash
docker compose up --build
```

Or, without Docker, run it from the backend directory with uv:

```bash
cd backend
uv run -m prooflab_api.main
```

`uv run prooflab_api/main.py` also works when you prefer to launch the file directly.

For local Python settings, put `AI_PROVIDER`, provider URLs, models, and keys in the repository `.env`, `backend/.env`, or `backend/prooflab_api/.env`. The closer file wins; exported shell/deployment variables always take precedence over every file.

Open [http://localhost:3000](http://localhost:3000). The frontend calls `http://127.0.0.1:8000` by default; override it with `NEXT_PUBLIC_PROOFLAB_API_URL` in `.env.local`.

Run frontend checks with:

```bash
npm run lint
npm run test:unit
npm run build
```

With the FastAPI service running (locally or through Docker Compose), run browser flows with:

```bash
npm run test:e2e
```

Run the Python verifier tests with uv:

```bash
cd backend
uv run pytest -q
```

## Architecture

Next.js is frontend-only. The browser calls the single FastAPI backend directly:

```text
Proof Board → FastAPI /verify → restricted parser → SymPy verifier
Proof Board → FastAPI /explain → Ollama | OpenAI-compatible API | local fallback
```

FastAPI publishes OpenAPI contracts at `/openapi.json`, accepts requests only from `FRONTEND_ORIGIN`, and constructs symbolic expressions from a restricted grammar—never raw learner input.

## Learning modes

- **Algebra:** one-variable linear and quadratic equation transformations.
- **Derivative:** polynomial `f(x) = …` to `f'(x) = …`, including constant, sum, product, power, and polynomial chain rules.
- **Complex simplify:** rectangular arithmetic with rational values and `i`.
- **Complex solve:** simple `x² + c = 0` equations with rational imaginary roots, entered as `{bi, -bi}`.

Trigonometry, integration, variable denominators, radicals, polar form, and general complex quadratics deliberately return `unsupported` for now.

## AI teaching layer

The FastAPI `/explain` endpoint provides the server-side teaching integration. Set `AI_PROVIDER` in the backend environment:

```bash
# Local Ollama
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b

# Any Chat Completions-compatible endpoint
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=https://your-provider.example/v1
OPENAI_COMPATIBLE_MODEL=your-model-id
OPENAI_COMPATIBLE_API_KEY=server-only-secret

# Explicit offline UI-demo fallback
AI_PROVIDER=local
```

The provider receives only verified evidence and must return concise structured teaching content. It never decides whether a transition is correct, and every repair is reverified before ProofLab applies it.

## Problems

Use **Choose a problem** to load algebra, calculus, and complex-number examples. **Start your own** currently creates an algebra problem with an equation using `x`; arbitrary natural-language questions are intentionally not sent to the verifier.
