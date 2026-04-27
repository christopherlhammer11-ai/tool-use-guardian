# Tool Use Guardian

**Reliability wrapper for AI tool calls.** Tool Use Guardian wraps brittle API/tool calls with retries, timeouts, JSON repair, and structured failure metadata.

Demo: **Watch the demo:** [Tool-Use Guardian](https://christopherhammer.dev/assets/videos/narrated/project-demos/tool-use-guardian-narrated.mp4)

## Who Uses It

- AI teams shipping agents that call APIs
- Chatbots that depend on inventory, search, CRM, or database tools
- Coding agents that need reliable command/tool execution
- Structured-output workflows that cannot crash on malformed JSON

## What It Solves

Production agents fail in boring ways: a tool times out, JSON is malformed, a field is missing, or an API returns a partial response. Guardian makes those failures observable and recoverable.

## Core Features

- Retry wrapper for async functions
- Timeout enforcement
- Exponential backoff patterns
- JSON repair helpers
- Structured success/failure result metadata
- Zero-dependency TypeScript implementation

## Example

```ts
import { guard, guardJson } from 'tool-use-guardian';

const result = await guard(
  () => callExternalApi(),
  { maxRetries: 3, timeout: 10000 }
);

const parsed = await guardJson(
  () => llm.generate({ prompt: 'Return valid JSON' })
);
```

## Quick Start

```bash
npm install
npm run build
npm test
```

Run the unreliable-tool demo:

```bash
npm run build
npx ts-node examples/wrap-unreliable-tool.ts
```

## Portfolio Context

This is infrastructure for serious agents. It proves I think beyond prompt demos and into failure modes, recovery paths, and debuggable production behavior.

---

Built by **Christopher L. Hammer** - self-taught AI/product builder shipping local-first tools, demos, and real product surfaces.

- Portfolio: [christopherhammer.dev](https://christopherhammer.dev)
- Proof demos: [https://christopherhammer.dev#proof](https://christopherhammer.dev#proof)
- GitHub: [christopherlhammer11-ai](https://github.com/christopherlhammer11-ai)

