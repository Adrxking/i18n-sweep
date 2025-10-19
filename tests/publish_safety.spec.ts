import { describe, it, expect } from 'vitest';
import pkg from '../package.json';

describe('publish safety', () => {
  it('exposes only dist via files field and bin points to dist', () => {
    expect(pkg.files).toEqual(['dist']);
    expect(pkg.bin && pkg.bin['i18n-sweep']).toMatch(/^\.\/dist\//);
  });

  it('has no accidental private data fields', () => {
    // basic checks
    expect(pkg.scripts.prepare).toBeDefined();
    // do not expose repository secrets or env
    const text = JSON.stringify(pkg);
    expect(text).not.toMatch(/SECRET|TOKEN|API_KEY|PASSWORD/i);
  });
});


