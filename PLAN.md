# Workspace RAG Index (Bun) — Project Plan

A learning project: build a persistent, reusable index of a local workspace, search it
(keyword first, vectors later), expose it over MCP, and optionally add an LLM `ask` step.

## Goals
- Learn RAG end to end: load, chunk, index, retrieve, augment, generate, cite.
- Build a **cache**: index the workspace once, reuse it repeatedly, update only changed files.
- Run on a low-power machine: no local models. Phases 0-5 need no AI API at all.

## RAG in brief
1. **Load** files from the workspace.
2. **Chunk** into ~200-800 token pieces (code: split at function boundaries). Chunking is the biggest quality lever.
3. **Index** chunks in SQLite: keyword index (FTS5/BM25), optionally vectors.
4. **Retrieve** top-k chunks for a question.
5. **Augment** a prompt: context chunks + question + "answer only from context, cite sources".
6. **Generate** the answer with an LLM.
7. **Cite** file and line numbers.

Steps 1-3 run offline per file change (the cache). Steps 4-7 run per question.

Retrieval types: keyword (exact, free), vector (meaning, needs embeddings), hybrid (both; usual production choice).

Common failures: bad chunk boundaries, retrieval missing the right chunk (most "RAG bugs"), too many chunks burying the relevant one.

## Stack
| Job | Choice |
|---|---|
| Runtime | Bun + TypeScript |
| Storage and search | `bun:sqlite` with FTS5 (BM25); `sqlite-vec` or brute-force cosine later |
| Model calls (phase 6+) | Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) |
| Chunking | LangChain.js text splitters (only what is needed) |
| Agent loop (optional, later) | LangGraph.js |
| MCP server | `@modelcontextprotocol/sdk`, stdio transport |
| Embeddings (optional, later) | Hosted API (Voyage AI, or a free-tier provider); Anthropic has no embeddings endpoint |

Compatibility of LangChain/LangGraph/MCP SDK on Bun is to be verified in phase 0.

## The cache (single SQLite file, e.g. `.workspace-index.db`)
| Layer | Contents | Model needed |
|---|---|---|
| File manifest | path, size, content hash, indexed-at; re-index only changed files | No |
| Full-text index | chunks in FTS5, BM25 ranking | No |
| Symbol index | functions/classes/exports and definition locations | No |
| Embeddings (optional) | vector per chunk, computed once | Yes (once per chunk) |
| Answer cache (optional) | LLM answers keyed by hash of question + retrieved context | Only on miss |

## Where a model is needed
Querying the local DB is free. Models are needed only to (a) turn text into vectors and
(b) write the final answer. Phases 0-5 use neither.

## Phases
0. **Setup**: Bun project; verify LangChain splitters, AI SDK and MCP SDK run on Bun.
1. **Manifest**: walk the workspace, respect `.gitignore`, hash files.
2. **Chunking**: function-level chunks for code (tree-sitter if available), size-based for the rest.
3. **Keyword search**: FTS5 + BM25, CLI `search` command with file/line results.
4. **Symbols**: symbol index, `def` and `usages` commands.
5. **Incremental updates**: re-index changed files only; optional file watcher.
6. **MCP server** exposing `search_workspace`, `find_symbol`, `find_usages`, `index_status`; test from Claude Code. Also a small `ask` command (Claude Haiku via AI SDK + answer cache) to learn prompt augmentation and generation firsthand.
7. **Embeddings and hybrid ranking** (optional): hosted embeddings, merge BM25 and vector scores, compare on a small question set.

## Notes on query types
- Named symbol ("what does `calculateTax` do?"): exact lookup (grep/symbol index + read file); embeddings add little.
- Concept with unknown names ("where do we handle failed payments?"): semantic search helps.
- Broad flow: combine search with follow-up reads (agent loop).

## MCP fit
The index is exposed as an MCP server so existing clients (Claude Code, Cursor, Copilot, etc.)
provide the chat UI, agent loop and model. This project stays focused on retrieval.

## Cost notes
- Phases 0-5: no API cost.
- `ask` and embeddings use API credits (Anthropic Console credits, separate from a Claude.ai plan).
- Use Claude Haiku for development; set a monthly spend limit in the Console.

## Open questions
- Anthropic API key available for phase 6?
- Embeddings provider for phase 7 (Voyage vs a free-tier option)?
- Which workspace/repo to index while developing (or generate a small sample project)?
