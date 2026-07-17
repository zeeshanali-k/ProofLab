# ProofLab

ProofLab is a visual algebra-reasoning debugger for one-variable linear and quadratic equations. Rather than marking a learner wrong, it identifies the first transition that changes the equation and gives a concrete counterexample.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run checks with:

```bash
npm run lint
npm run test:unit
npm run build
```

## Architecture

The browser calls Next.js routes only:

```text
Proof Board → /api/verify → VerificationProvider → MathJsVerifier (MVP)
                                             └──→ SympyVerifier (future private service)
Proof Board → /api/explain → TeachingProvider → Ollama | OpenAI-compatible API | local fallback
```

`VERIFIER_PROVIDER=mathjs` is the default. Set `VERIFIER_PROVIDER=sympy` and `SYMPY_VERIFIER_URL` to move verification behind a private Python service without changing the UI or route contracts.
Copy `.env.example` to `.env.local` to configure either option.

The verifier accepts only `x`, integer/rational constants, basic arithmetic, parentheses, powers through two, and one equals sign. It never evaluates raw user input. Unsupported expressions are labelled honestly rather than marked correct.

## AI teaching layer

The explanation route is an actual server-side AI integration. Set `AI_PROVIDER` in `.env.local`:

```bash
# Local Ollama (default)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b

# Any Chat Completions-compatible endpoint
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=https://your-provider.example/v1
OPENAI_COMPATIBLE_MODEL=your-model-id
OPENAI_COMPATIBLE_API_KEY=server-only-secret
```

For Ollama, install it, run `ollama pull llama3.2:3b`, and keep the local service running. The browser never receives either provider URL or API key. `AI_PROVIDER=local` is an explicit offline fallback for UI demos.

The model receives verified evidence and must return concise JSON. It never determines whether a transition is correct, and a repair returned by the model is replaced with the verifier-approved candidate before it is shown.

## Problems

Use **Choose a problem** to load examples for a missing square term, linear balancing, a negative cross term, or solution substitution. **Start your own** accepts a title, an algebra starting equation, and a learner goal. The starting equation must remain within the published one-variable linear/quadratic scope; arbitrary natural-language questions are intentionally not sent to the algebra verifier.
