# Tool Use Guardian

Zero-dependency reliability wrapper for LLM tool calls with automatic retry,
timeouts, JSON repair, and structured failure metadata.

<!-- badges -->

## What It Does

Tool Use Guardian wraps agent tool calls with exponential backoff, timeouts, and
automatic JSON repair so LLM workflows fail less often and fail more visibly.

It is built for teams shipping tool-using agents where flaky APIs, malformed JSON,
and slow third-party services can break the user experience.

## Features

- **guard()**: Wrap any async function with retry, timeout, and exponential backoff
- **guardJson()**: Auto-repair malformed JSON responses from LLMs
- **safeJsonParse()**: Standalone JSON parser with error recovery
- **GuardResult**: Detailed metadata (attempts, timing, error trace, repairs)
- **Zero Dependencies**: Ships as pure TypeScript
- **Package Ready**: Build, tests, and npm pack dry-run verified

## Quick Start

Until the npm package is published, install from the GitHub repo or a local
tarball. The `tool-use-guardian` npm package name is currently available.

```bash
npm install github:christopherlhammer11-ai/tool-use-guardian
```

## Usage

```typescript
import { guard, guardJson } from 'tool-use-guardian';

// Wrap an async tool call with retry logic
const result = await guard(
  () => callExternalAPI(),
  { maxRetries: 3, timeout: 10000 }
);

console.log(result.success, result.attempts, result.timing);

// Auto-repair JSON from an LLM
const repaired = await guardJson(
  () => llm.generate({ prompt: 'return json' }),
  { strict: false }
);

console.log(repaired.data); // Cleaned JSON object
console.log(repaired.repairs); // List of fixes applied
```

## Example

This repo includes a small unreliable-tool demo:

```bash
npm run build
npx ts-node examples/wrap-unreliable-tool.ts
```

It simulates a flaky external service, retries the call, applies a timeout, and
then parses the returned JSON through the same reliability layer.

## Tech Stack

- TypeScript (pure implementation)
- Async/await (native Node.js)
- Jest test suite

## Product Status

Verified on April 22, 2026:

- `npm test` passes: 21 tests
- `npm run build` passes
- `npm pack --dry-run` produces a clean 6.6 kB package

Known polish:

- Public npm publish is the remaining account action.

## Commercial Path

- Open-source package for developer adoption
- Paid integration audit for teams adding tools to agents
- Paid reliability hardening for existing agent workflows

## Release Checklist

- [x] Build passes
- [x] Tests pass
- [x] Open-handle warning cleaned up
- [x] Example tool wrapper included
- [x] Package dry-run verified
- [ ] Publish to npm
- [ ] Add OpenAI/Anthropic tool-calling integration examples

## Author

Christopher L. Hammer  
GitHub: [christopherlhammer11-ai](https://github.com/christopherlhammer11-ai)  
Portfolio: [AI Engineering Portfolio](https://2026-04-21-that-s-a-full-green-run.vercel.app)
