export interface GuardOptions {
  /** Max retries. Default: 3 */
  retries?: number;
  /** Timeout per attempt in ms. Default: 10000 */
  timeout?: number;
  /** Retry delay in ms (doubles each retry). Default: 1000 */
  retryDelay?: number;
  /** Attempt to repair broken JSON responses. Default: true */
  repairJson?: boolean;
  /** Validate response with a custom check. */
  validate?: (result: unknown) => boolean;
  /** Called on each retry with error info. */
  onRetry?: (attempt: number, error: Error) => void;
}

export interface GuardResult<T> {
  success: boolean;
  data: T | null;
  attempts: number;
  totalTimeMs: number;
  errors: string[];
  repaired: boolean;
}

export type ToolFn<T> = () => Promise<T>;
