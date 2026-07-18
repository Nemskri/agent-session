# Agentic AI — Hands-On Session

### LLM · Tools / MCP · Memory (4 types) · Build-Your-Own Agent

**Duration ~3.5 hrs · Stack: Node.js + JavaScript · Vercel AI SDK (provider-agnostic) · OpenAI API key provided**

---

## Session at a glance

One running use-case ties everything together — participants build a "Support Agent" step by step. Every concept is a feature they add to it, so the capstone is just assembling the pieces.

| Time | Block | What happens |
| :--- | :--- | :--- |
| 0:00–0:15 | Concept intro | Whiteboard. LLM vs Agent vs Workflow. The agent loop. What MCP is. The 4 memory types. |
| 0:15–0:45 | LLM & the loop | Demo: a raw LLM call has no memory. Exercise: wrap it in a loop (short-term memory = the messages array). |
| 0:45–1:30 | Tools / MCP | Demo: declare a tool, model calls it. Then the same tool via MCP. Exercise: add your own second tool. |
| 1:30–1:45 | Break | |
| 1:45–2:35 | Memory (4 types) | Four mini-demos: short-term, long-term (JSON), episodic (JSON), semantic/RAG (md + embeddings). |
| 2:35–3:35 | Capstone | Build the full Support Agent: tools + all memory types on the shared use-case. |
| 3:35–3:50 | Wrap-up | Q&A. Where to go next (real vector DBs, frameworks, production concerns). |

## The running use-case — Support Agent

A command-line agent that helps a user with support requests. It gains one capability at a time:
- **Talks to an LLM** — answers questions in a chat loop.
- **Uses a tool** — e.g. `create_ticket(issue)`. Declared once directly, then once via MCP.
- **Remembers the user** — name / role / preferences persist across runs.
- **Recalls past sessions** — "last time we opened ticket #42."
- **Answers from docs** — grounded in a small FAQ via retrieval (RAG).

## The four memory types

Core mental model. Two are simple file reads; one needs embeddings.
1. **Short-term (working)** — the live conversation during one run (the messages array). Handled by the SDK's session/history; nothing to persist.
2. **Long-term (persistent facts)** — `memory/profile.json`, structured key/value facts. Exact-key lookup, no LLM needed to retrieve.
3. **Episodic (past events)** — append-only array in `memory/episodes.json`, one summary line per session. On startup, load the last N.
4. **Semantic (RAG over docs)** — source docs as `docs/*.md`, embedded once into `memory/embeddings.json` as `{ text, vector }` pairs. On a question: embed it → cosine-similarity search → inject top matches into the prompt.

*JSON = exact recall. Embeddings = fuzzy / semantic recall.*

## Tooling

- **Vercel AI SDK** (`ai` package) — provider-agnostic; swap one line to change model. Declarative tools + auto tool-loop.
- **MCP client** — attach an MCP server to expose the same tool the standard way. Use stdio or Streamable HTTP (SSE is deprecated).
- **OpenAI embeddings endpoint** — for RAG. Cosine similarity written by hand (~10 lines), no vector DB.
- **Plain files for memory** — JSON + md, human-readable.

## Ground rules

- Never hardcode the API key — use a `.env` file, never commit it.
- Pin `zod` to v4 — the SDK requires it; the wrong version gives a cryptic schema error.
- Embed once, cache it — don't re-embed docs every run.

## Your capstone

Combine everything: an agent with the `create_ticket` tool, long-term profile memory, episodic session log, and RAG over the provided FAQ. Stretch goal: expose the tool through an MCP server, and write a per-session summary to `episodes.json` on exit.
