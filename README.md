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
Proof Board → /api/explain → evidence-bound teaching response
```

`VERIFIER_PROVIDER=mathjs` is the default. Set `VERIFIER_PROVIDER=sympy` and `SYMPY_VERIFIER_URL` to move verification behind a private Python service without changing the UI or route contracts.
Copy `.env.example` to `.env.local` to configure either option.

The verifier accepts only `x`, integer/rational constants, basic arithmetic, parentheses, powers through two, and one equals sign. It never evaluates raw user input. Unsupported expressions are labelled honestly rather than marked correct.

## AI teaching layer

The explanation route uses verified evidence and provides a local, bounded fallback while `OPENAI_API_KEY` is absent. It is intentionally not an open-ended chat feature. Add an OpenAI-backed provider only after configuring the server-side key; it must receive the already-verified result and never decide correctness.
