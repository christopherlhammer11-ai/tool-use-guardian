# Tool Use Guardian Examples

This example wraps an unreliable search-like tool call with timeout and retry
behavior, then parses the tool output through `guardJson`.

```bash
npm run build
npx ts-node examples/wrap-unreliable-tool.ts
```

Use this as the smallest reviewer demo: it shows the difference between a tool
call that simply throws and a tool call that returns inspectable reliability
metadata.
