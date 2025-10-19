import { describe, it, expect } from 'vitest';
import { consoleReporter } from '../src/reporters/consoleReporter';
import { jsonReporter } from '../src/reporters/jsonReporter';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('reporters', () => {
  const report = {
    summary: { totalKeys: 3, used: 2, unused: 1, missing: 0, kbSaved: 0 },
    locales: ['en', 'es'],
    unused: ['unused.key'],
    missing: [],
  };

  it('consoleReporter prints summary without throwing', () => {
    consoleReporter(report as any);
  });

  it('jsonReporter writes to file', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'i18n-sweep-'));
    const out = path.join(dir, 'report.json');
    await jsonReporter(report as any, out);
    const contents = readFileSync(out, 'utf8');
    const parsed = JSON.parse(contents);
    expect(parsed.summary.totalKeys).toBe(3);
    expect(parsed).not.toHaveProperty('findings');
    expect(parsed).not.toHaveProperty('files');
    expect(Array.isArray(parsed.unused)).toBe(true);
    expect(Array.isArray(parsed.missing)).toBe(true);
    expect(parsed.summary).toHaveProperty('kbSaved');
    expect(parsed.summary).toHaveProperty('missing');
  });
});


