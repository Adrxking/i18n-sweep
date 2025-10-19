import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { parseDictionaries } from '../src/parser/dictionaryParser';

describe('dictionaryParser', () => {
  it('parses JSON and YAML dictionaries and flattens keys', async () => {
    const root = path.resolve(__dirname, '../fixtures/vue-advanced');
    const info = await parseDictionaries(root, [
      'src/locales/en/common.yaml',
      'src/locales/es/common.yml',
      'src/locales/**/*.json',
    ]);
    expect(info.locales).toContain('en');
    expect(info.locales).toContain('es');
    const en = info.keysByLocale.get('en');
    expect(en).toBeTruthy();
    expect(en?.has('greet.hello')).toBe(true);
    expect(en?.has('errors.required')).toBe(true);
  });
});


