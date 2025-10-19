import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { extractCodeUsages } from '../src/parser/codeParser';
import { globFiles } from '../src/scanner/fileSystem';

describe('codeParser', () => {
  it('detects literals, template prefixes and concatenations', async () => {
    const root = path.resolve(__dirname, '../fixtures/vue-advanced');
    // just ensure file exists, then run extraction
    const files = await globFiles(root, ['src/components/*.vue']);
    expect(files.length).toBeGreaterThan(0);
    const info = await extractCodeUsages(root);
    expect(info.literalKeys.has('greet.hello')).toBe(true);
    expect(info.literalKeys.has('errors.required')).toBe(true);
    expect(info.literalKeys.has('opt.hello')).toBe(true);
    expect([...info.dynamicPrefixes]).toContain('errors.');
  });

  it('supports custom i18n function names via parameter', async () => {
    const root = path.resolve(__dirname, '../fixtures/custom-fns');
    const info = await extractCodeUsages(root, ['translate', 'i18n.translate']);
    expect(info.literalKeys.has('custom.working')).toBe(true);
  });
});


