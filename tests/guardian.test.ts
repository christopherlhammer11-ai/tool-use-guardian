import { guard, guardJson } from '../src/guardian';

describe('guard', () => {
  it('succeeds on first attempt', async () => {
    const result = await guard(async () => 42);
    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
    expect(result.attempts).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  it('retries on failure and succeeds', async () => {
    let callCount = 0;
    const result = await guard(async () => {
      callCount++;
      if (callCount < 3) throw new Error('fail');
      return 'ok';
    }, { retries: 3, retryDelay: 10 });

    expect(result.success).toBe(true);
    expect(result.data).toBe('ok');
    expect(result.attempts).toBe(3);
    expect(result.errors).toHaveLength(2);
  });

  it('fails after max retries', async () => {
    const result = await guard(async () => {
      throw new Error('always fails');
    }, { retries: 2, retryDelay: 10 });

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.attempts).toBe(3); // initial + 2 retries
    expect(result.errors).toHaveLength(3);
  });

  it('times out slow functions', async () => {
    const result = await guard(
      () => new Promise<string>(() => undefined),
      { timeout: 50, retries: 0 },
    );

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Timeout');
  });

  it('calls onRetry callback', async () => {
    const retries: number[] = [];
    let callCount = 0;

    await guard(async () => {
      callCount++;
      if (callCount < 2) throw new Error('fail');
      return true;
    }, {
      retries: 2,
      retryDelay: 10,
      onRetry: (attempt) => retries.push(attempt),
    });

    expect(retries).toEqual([1]);
  });

  it('uses custom validator', async () => {
    let callCount = 0;
    const result = await guard(async () => {
      callCount++;
      return callCount >= 2 ? { valid: true } : { valid: false };
    }, {
      retries: 3,
      retryDelay: 10,
      validate: (data: unknown) => (data as { valid: boolean }).valid === true,
    });

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
  });

  it('tracks total time', async () => {
    const result = await guard(async () => 'fast');
    expect(result.totalTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.totalTimeMs).toBeLessThan(1000);
  });
});

describe('guardJson', () => {
  it('parses valid JSON response', async () => {
    const result = await guardJson<{ name: string }>(
      async () => '{"name": "test"}',
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'test' });
    expect(result.repaired).toBe(false);
  });

  it('repairs broken JSON response', async () => {
    const result = await guardJson<{ name: string }>(
      async () => '{"name": "test",}', // trailing comma
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'test' });
    expect(result.repaired).toBe(true);
  });

  it('retries on completely invalid JSON', async () => {
    let callCount = 0;
    const result = await guardJson(async () => {
      callCount++;
      if (callCount < 2) return 'not json at all';
      return '{"ok": true}';
    }, { retries: 2, retryDelay: 10 });

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
  });
});
