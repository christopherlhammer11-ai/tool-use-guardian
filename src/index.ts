/**
 * Tool Use Guardian — Reliability wrapper for LLM agent tool calls.
 *
 * @example
 * ```typescript
 * import { guard, guardJson, safeJsonParse, repairJson } from 'tool-use-guardian';
 *
 * // Wrap any async tool call with retries + timeout
 * const result = await guard(() => callExternalApi(), {
 *   retries: 3,
 *   timeout: 5000,
 *   validate: (data) => data !== null,
 * });
 *
 * // Guard a function returning raw JSON string (auto-repairs)
 * const jsonResult = await guardJson<MyType>(() => fetchRawResponse());
 *
 * // Repair broken JSON from LLM output
 * const { data } = safeJsonParse('{"key": "value",}'); // trailing comma fixed
 * ```
 */

export { guard, guardJson } from './guardian';
export { repairJson, safeJsonParse } from './json-repair';
export type { GuardOptions, GuardResult, ToolFn } from './types';
