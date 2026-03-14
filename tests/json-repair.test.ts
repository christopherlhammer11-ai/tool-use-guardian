import { repairJson, safeJsonParse } from '../src/json-repair';

describe('repairJson', () => {
  it('removes trailing commas', () => {
    const { repaired, fixed } = repairJson('{"a": 1, "b": 2,}');
    expect(JSON.parse(repaired)).toEqual({ a: 1, b: 2 });
    expect(fixed).toContain('removed trailing commas');
  });

  it('adds missing closing brackets', () => {
    const { repaired, fixed } = repairJson('{"a": [1, 2, 3]');
    expect(JSON.parse(repaired)).toEqual({ a: [1, 2, 3] });
    expect(fixed.some(f => f.includes('closing bracket'))).toBe(true);
  });

  it('strips markdown code fences', () => {
    const input = '```json\n{"key": "value"}\n```';
    const { repaired, fixed } = repairJson(input);
    expect(JSON.parse(repaired)).toEqual({ key: 'value' });
    expect(fixed).toContain('stripped markdown code fences');
  });

  it('quotes unquoted keys', () => {
    const { repaired, fixed } = repairJson('{name: "test", age: 25}');
    expect(JSON.parse(repaired)).toEqual({ name: 'test', age: 25 });
    expect(fixed).toContain('quoted unquoted keys');
  });

  it('handles already valid JSON', () => {
    const { repaired, fixed } = repairJson('{"valid": true}');
    expect(JSON.parse(repaired)).toEqual({ valid: true });
    expect(fixed).toHaveLength(0);
  });

  it('handles nested missing brackets', () => {
    const { repaired } = repairJson('{"a": {"b": [1, 2');
    const parsed = JSON.parse(repaired);
    expect(parsed.a.b).toEqual([1, 2]);
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON directly', () => {
    const { data, repaired } = safeJsonParse('{"x": 1}');
    expect(data).toEqual({ x: 1 });
    expect(repaired).toBe(false);
  });

  it('repairs and parses broken JSON', () => {
    const { data, repaired, fixes } = safeJsonParse('{"x": 1,}');
    expect(data).toEqual({ x: 1 });
    expect(repaired).toBe(true);
    expect(fixes.length).toBeGreaterThan(0);
  });

  it('returns null for completely unrecoverable input', () => {
    const { data, repaired } = safeJsonParse('not json at all');
    expect(data).toBeNull();
    expect(repaired).toBe(false);
  });

  it('handles arrays', () => {
    const { data } = safeJsonParse('[1, 2, 3]');
    expect(data).toEqual([1, 2, 3]);
  });

  it('repairs array with trailing comma', () => {
    const { data, repaired } = safeJsonParse('[1, 2, 3,]');
    expect(data).toEqual([1, 2, 3]);
    expect(repaired).toBe(true);
  });
});
