# Tool Use Guardian

Zero-dependency reliability wrapper for LLM tool calls with automatic retry and JSON repair.

<!-- badges -->

## What It Does

Tool Use Guardian wraps every tool call with exponential backoff, timeouts, and automatic JSON repair—turning flaky LLM outputs into bulletproof results. No external dependencies; pure TypeScript.

## Features

- **guard()**: Wrap any async function with retry, timeout, and exponential backoff
- **guardJson()**: Auto-repair malformed JSON responses from LLMs
- **safeJsonParse()**: Standalone JSON parser with error recovery
- **GuardResult**: Detailed metadata (attempts, timing, error trace, repairs)
- **Zero Dependencies**: Ships as pure TypeScript, <2KB gzipped
- **Battle-Tested**: 1-star GitHub repo from production use cases

## Quick Start

```bash
npm install tool-use-guardian
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

## Tech Stack

- TypeScript (pure implementation)
- Async/await (native Node.js)

## Part of Genesis Marketplace

Ensures reliable tool calls across all Genesis agent integrations.

## Author

Christopher L. Hammer  
GitHub: [christopherlhammer11-ai](https://github.com/christopherlhammer11-ai)  
Sites: [hammercg.com](https://hammercg.com) | [hammerlockai.com](https://hammerlockai.com)
