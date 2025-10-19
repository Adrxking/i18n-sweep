import { describe, it, expect } from 'vitest';
import { matchFindings } from '../src/analysis/matcher';

describe('matcher', () => {
  it('classifies unused, missing and dynamic keys', () => {
    const dict = {
      locales: ['en'],
      keysByLocale: new Map([
        ['en', new Set(['a.b', 'errors.required'])],
      ]),
    };
    const code = {
      literalKeys: new Set(['a.b', 'missing.literal']),
      dynamicPrefixes: new Set(['errors.']),
      missingCalls: new Set(),
    };
    const report = matchFindings(dict as any, code as any);
    // unused should NOT include errors.required because it's covered by errors.* dynamic
    expect(report.unused).toEqual([]);
    expect(report.missing).toContain('missing.literal');
  expect(report.summary.missing).toBe(report.missing.length);
  });
});


