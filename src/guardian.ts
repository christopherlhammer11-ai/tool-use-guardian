import { GuardOptions, GuardResult, ToolFn } from './types';

const DEFAULT_OPTIONS: Required<Omit<GuardOptions, 'validate' | 'onRetry'>> = {
  retries: 3,
  timeout: 10000,
  retryDelay: 1000,
  repairJson: true,
};

/**
 * Wrap a tool call with retries, timeouts, and error recovery.
 *
 * @example
 * ```ts
 * const result = await guard(() => fetch('https://api.example.com/data').then(r => r.json()));
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export async function guard<T>(
  fn: ToolFn<T>,
  options?: GuardOptions,
): Promise<GuardResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const start = Date.now();
  let attempts = 0;

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    attempts++;

    try {
      const data = await withTimeout(fn, opts.timeout);

      // Validate if validator provided
      if (opts.validate && !opts.validate(data)) {
        const msg = `Validation failed on attempt ${attempt + 1}`;
        errors.push(msg);
        if (attempt < opts.retries) {
          opts.onRetry?.(attempt + 1, new Error(msg));
          await sleep(opts.retryDelay * Math.pow(2, attempt));
          continue;
        }
        return {
          success: false,
          data,
          attempts,
          totalTimeMs: Date.now() - start,
          errors,
          repaired: false,
        };
      }

      return {
        success: true,
        data,
        attempts,
        totalTimeMs: Date.now() - start,
        errors,
        repaired: false,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Attempt ${attempt + 1}: ${message}`);

      if (attempt < opts.retries) {
        opts.onRetry?.(attempt + 1, err instanceof Error ? err : new Error(message));
        await sleep(opts.retryDelay * Math.pow(2, attempt));
      }
    }
  }

  return {
    success: false,
    data: null,
    attempts,
    totalTimeMs: Date.now() - start,
    errors,
    repaired: false,
  };
}

/**
 * Guard a function that returns a string, attempting JSON repair on the response.
 */
export async function guardJson<T = unknown>(
  fn: ToolFn<string>,
  options?: GuardOptions,
): Promise<GuardResult<T>> {
  const { safeJsonParse } = await import('./json-repair');

  const result = await guard(async () => {
    const raw = await fn();
    const { data, repaired, fixes } = safeJsonParse<T>(raw);
    if (data === null) {
      throw new Error(`JSON parse failed: ${fixes.join(', ')}`);
    }
    return { data, repaired, fixes };
  }, {
    ...options,
    repairJson: false, // we handle it ourselves
  });

  if (result.success && result.data) {
    const inner = result.data as { data: T; repaired: boolean };
    return {
      ...result,
      data: inner.data,
      repaired: inner.repaired,
    };
  }

  return {
    ...result,
    data: null,
  };
}

function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);

    fn().then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
