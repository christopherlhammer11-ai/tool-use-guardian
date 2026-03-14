/**
 * Attempt to repair common JSON issues that LLMs produce.
 */
export function repairJson(input: string): { repaired: string; fixed: string[] } {
  let result = input.trim();
  const fixed: string[] = [];

  // Strip markdown code fences
  if (result.startsWith('```')) {
    const firstNewline = result.indexOf('\n');
    const lastFence = result.lastIndexOf('```');
    if (lastFence > firstNewline) {
      result = result.slice(firstNewline + 1, lastFence).trim();
      fixed.push('stripped markdown code fences');
    }
  }

  // Remove trailing commas before } or ]
  const trailingComma = result.replace(/,(\s*[}\]])/g, '$1');
  if (trailingComma !== result) {
    result = trailingComma;
    fixed.push('removed trailing commas');
  }

  // Replace single quotes with double quotes (but not inside strings)
  if (/'[^']*'\s*:/g.test(result) && !/"/.test(result)) {
    result = result.replace(/'/g, '"');
    fixed.push('replaced single quotes with double quotes');
  }

  // Add missing closing brackets
  const opens = (result.match(/[{[]/g) || []).length;
  const closes = (result.match(/[}\]]/g) || []).length;
  if (opens > closes) {
    // Determine what brackets are needed
    const stack: string[] = [];
    for (const char of result) {
      if (char === '{') stack.push('}');
      else if (char === '[') stack.push(']');
      else if (char === '}' || char === ']') stack.pop();
    }
    result += stack.reverse().join('');
    fixed.push(`added ${opens - closes} missing closing bracket(s)`);
  }

  // Fix unquoted keys: { key: "value" } → { "key": "value" }
  const unquotedKeys = result.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
  if (unquotedKeys !== result) {
    result = unquotedKeys;
    fixed.push('quoted unquoted keys');
  }

  // Remove control characters that break JSON
  const cleaned = result.replace(/[\x00-\x1f\x7f]/g, (match) => {
    if (match === '\n' || match === '\r' || match === '\t') return match;
    return '';
  });
  if (cleaned !== result) {
    result = cleaned;
    fixed.push('removed control characters');
  }

  return { repaired: result, fixed };
}

/**
 * Try to parse JSON, repairing if needed.
 */
export function safeJsonParse<T = unknown>(input: string): {
  data: T | null;
  repaired: boolean;
  fixes: string[];
} {
  // Try direct parse first
  try {
    return { data: JSON.parse(input) as T, repaired: false, fixes: [] };
  } catch {
    // Try repair
    const { repaired, fixed } = repairJson(input);
    try {
      return { data: JSON.parse(repaired) as T, repaired: true, fixes: fixed };
    } catch {
      return { data: null, repaired: false, fixes: [...fixed, 'repair failed — still invalid JSON'] };
    }
  }
}
