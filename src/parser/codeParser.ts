import { globFiles, readTextFile } from '../scanner/fileSystem';

export type CodeInfo = {
  literalKeys: Set<string>;
  dynamicPrefixes: Set<string>;
  missingCalls: Set<string>; // variables passed directly, etc. (for future use)
};

const SOURCE_GLOBS = [
  '**/*.{ts,tsx,js,jsx,vue}',
];

const IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/coverage/**',
  '**/.turbo/**',
  '**/.next/**',
];

function buildPatterns(customFns?: string[]) {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Only match intended i18n callees:
  //  - standalone: $t( or t( not preceded by word/$
  //  - property: this.$t(, i18n.t(, useI18n().t(
  const baseStandalone = ['(?<![\\w$])\\$?t'];
  const baseProperty = ['i18n\\.t', 'useI18n\\(\\)\\.t', 'this\\.\\$?t'];
  const userTokens = (customFns || [])
    .map((f) => f.trim())
    .filter(Boolean)
    .flatMap((name) => {
      const safe = esc(name);
      if (safe.includes('\\.')) return [safe];
      return [`(?<![\\w$])${safe}`, `\\.${safe}`];
    });
  const tokens = [...baseStandalone, ...baseProperty, ...userTokens];
  const callee = '(?:' + tokens.join('|') + ')';

  const candidate = new RegExp(callee + '\\(', 'm');
  // Literals: fn('a.b') or fn("a.b")
  const literalRe = new RegExp(callee + '\\(\\s*(?:' +
    '\\' + "'" + '([^\\' + "'" + '`\\n\\r]+)\\' + "'" + '|' +
    '"([^"`\\n\\r]+)")\\s*\\)', 'g');
  // Template literals: fn(`a.${x}`)
  const templateRe = new RegExp(callee + '\\(\\s*`([^`]+)`\\s*\\)', 'g');
  // Concatenations: fn('a.' + x) or fn("a." + x)
  const concatPrefixRe = new RegExp(callee + '\\(\\s*(?:' +
    '\\' + "'" + '([^\\' + "'" + '`\\n\\r]+\\.)\\' + "'" + '|' +
    '"([^"`\\n\\r]+\\.)")\\s*\\+\\s*[^)]+\\)', 'g');
  // Variable-only: fn(keyVar)
  const varOnlyRe = new RegExp(callee + '\\(\\s*[A-Za-z_$][\\w$]*\\s*\\)', 'g');
  return { candidate, literal: literalRe, template: templateRe, concatPrefix: concatPrefixRe, varOnly: varOnlyRe };
}

export async function extractCodeUsages(root: string, customFns?: string[]): Promise<CodeInfo> {
  const files = await globFiles(root, SOURCE_GLOBS, IGNORE);
  const literalKeys = new Set<string>();
  const dynamicPrefixes = new Set<string>();
  const missingCalls = new Set<string>();
  const { candidate, literal, template, concatPrefix, varOnly } = buildPatterns(customFns);

  const isLikelyI18nKey = (key: string): boolean => {
    if (!key || key.length > 512) return false;
    if (/[\s/\\]/.test(key)) return false; // no espacios ni slashes
    if (!key.includes('.')) return false; // requiere al menos un punto
    return /^[A-Za-z0-9_.-]+$/.test(key);
  };
  const isLikelyI18nPrefix = (prefix: string): boolean => {
    if (!prefix.endsWith('.')) return false;
    const base = prefix.slice(0, -1);
    if (!base || base.length > 512) return false;
    if ([...base].some((ch) => ch === ' ' || ch === '/' || ch === '\\')) return false;
    // Allow single segment or dotted segments
    return /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*$/.test(base);
  };

  for (const abs of files) {
    const text = await readTextFile(abs);
    if (!candidate.test(text)) continue;

    // literal calls: t('a.b')
    for (const m of text.matchAll(literal)) {
      const key = m[1] || m[2];
      if (key && isLikelyI18nKey(key)) literalKeys.add(key);
    }

    // template literals: t(`a.${x}`) -> prefix a.
    for (const m of text.matchAll(template)) {
      const content = m[1];
      const idx = content.indexOf('${');
      if (idx > 0) {
        const prefix = content.slice(0, idx);
        if (isLikelyI18nPrefix(prefix)) dynamicPrefixes.add(prefix);
      }
    }

    // concatenations: t('a.' + x)
    for (const m of text.matchAll(concatPrefix)) {
      const prefix = m[1] || m[2];
      if (prefix && isLikelyI18nPrefix(prefix)) dynamicPrefixes.add(prefix);
    }

    // naive detection of variable-only calls: t(keyVar)
    const varOnlyMatches = text.match(varOnly);
    if (varOnlyMatches) {
      for (const v of varOnlyMatches) missingCalls.add(v);
    }
  }

  return { literalKeys, dynamicPrefixes, missingCalls };
}


