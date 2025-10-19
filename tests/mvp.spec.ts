import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { scan } from '../src';

describe('i18n-sweep MVP', () => {
  it('scans fixtures and reports summary', async () => {
    const root = path.resolve(__dirname, '../fixtures/vue-basic');
    const report = await scan({ root, locales: ['src/locales/*.json'] });

    expect(report.summary.totalKeys).toBe(3);
    expect(report.summary.used).toBe(1);
    // dynamic prefixes still detected internamente, pero no se exponen en JSON
    // With only errors.* dynamic, greet.hello used => unused should be 1 (unused.key)
    expect(report.summary.unused).toBe(1);
    expect(report.missing.length).toBe(1);
    expect(report.missing).toContain('missing.key');
    expect(report.summary).toHaveProperty('missing');
    expect(report.summary).toHaveProperty('kbSaved');
  });
});


