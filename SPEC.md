# POC Spec — Study Buddy (CLI Agent)

A command-line study assistant that answers questions from a small notes file,
remembers the learner across runs, and can quiz them. Built to exercise
everything from the session: an LLM in a tool-loop + all four memory types.

**Stack:** Node.js · Vercel AI SDK (`ai`) · OpenAI (provided key)
**Interface:** terminal chat loop (readline)
**Storage:** local files only (JSON + md) — no database

---

## What it does

A learner runs `node app.js` and chats with the agent. It can:
- Answer questions grounded in a notes file (`docs/notes.md`) — **semantic memory / RAG**
- Hold a back-and-forth within the run — **session memory**
- Remember the learner's name, goal, and weak topics across runs — **procedural + long-term**
- Recall what happened in past sessions ("last time you struggled with closures") — **episodic memory**
- Create a quiz question via a **tool**

---

## The four memory types → features

| Type | What it stores | Where |
|---|---|---|
| **Session** | The live conversation this run | in-memory `messages[]` array |
| **Semantic** | Chunks of `docs/notes.md`, embedded | `memory/embeddings.json` |
| **Episodic** | One summary line per past session | `memory/episodes.json` (append-only) |
| **Procedural** | How to help THIS learner (name, goal, weak topics, preferred style) | `memory/profile.json` |

> Rule of thumb to keep straight: profile.json = facts about the learner
> (exact lookup). embeddings.json = knowledge to search (fuzzy lookup).

---

## Required behavior (build in this order)

1. **Chat loop** — read stdin, call the model, print reply, keep `messages[]`.
   Use `generateText` with `stopWhen: stepCountIs(5)`.

2. **Tool: `make_quiz_question`** — declared with the `tool()` helper + a Zod
   schema `{ topic: string }`. Returns a question + answer. The model calls it
   when the learner says "quiz me".

3. **Semantic / RAG** — on startup, if `memory/embeddings.json` is missing,
   split `docs/notes.md` into paragraphs, embed with `embedMany`
   (`openai.embedding('text-embedding-3-small')`), and cache to the file.
   On each question, `embed` the question, rank chunks with `cosineSimilarity`,
   inject the top 2–3 into the system prompt. **Embed once, cache, reuse.**

4. **Procedural** — load `memory/profile.json` at startup and put its contents
   in the system prompt ("The learner's name is X, goal is Y, weak on Z, prefers
   short answers"). Update it when the learner states a new goal/weakness.

5. **Episodic** — at startup, load the last 3 lines of `memory/episodes.json`
   and add them to the system prompt. On exit, ask the model for a one-line
   summary of the session and append it.

---

## File layout

```
study-buddy/
├─ app.js                  # entry: chat loop wiring it all together
├─ lib/
│  ├─ memory.js            # load/save profile, append/read episodes
│  ├─ rag.js               # buildIndex(), search(query)
│  └─ tools.js             # make_quiz_question
├─ docs/
│  └─ notes.md             # the study material (provided — ~1 page)
├─ memory/                 # created at runtime, gitignored
│  ├─ profile.json
│  ├─ episodes.json
│  └─ embeddings.json
├─ .env                    # OPENAI_API_KEY=...   (never commit)
├─ .gitignore              # node_modules, .env, memory/
└─ package.json
```

## Dependencies

```
npm i ai @ai-sdk/openai zod dotenv
```
Pin `zod` to v4. Import `embed`, `embedMany`, `cosineSimilarity`,
`generateText`, `tool`, `stepCountIs` from `ai`.

## Definition of done

- [ ] Chat loop holds context within a run (session)
- [ ] "Quiz me on X" triggers the tool
- [ ] Answers about the notes cite the right chunk (RAG working)
- [ ] Restarting the app, it greets the learner by name (procedural)
- [ ] Restarting, it references a past session (episodic)
- [ ] `.env` and `memory/` are gitignored

## Stretch goals

- Expose `make_quiz_question` through an MCP server + `createMCPClient`
- Track quiz score in `profile.json` and adapt difficulty
- Add a `reset` command that clears `memory/`
