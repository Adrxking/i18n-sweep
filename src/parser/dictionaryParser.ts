import path from 'node:path';
import { globFiles, readTextFile } from '../scanner/fileSystem';
import { parse as parseYaml } from 'yaml';
import { flattenToKeyPaths, flattenToKeyEntries } from '../utils/flatten';

export type DictionaryInfo = {
  locales: string[];
  keysByLocale: Map<string, Set<string>>;
  // bytesByLocale: estimated bytes occupied by raw JSON stringification of each dictionary
  bytesByLocale: Map<string, number>;
};

function inferLocaleFromPath(file: string): string | undefined {
  const segments = file.split(path.sep);
  const anchors = new Set(['locales', 'locale', 'i18n', 'translations', 'langs', 'languages', 'l10n']);
  const idx = segments.findIndex((seg) => anchors.has(seg));
  if (idx !== -1 && idx + 1 < segments.length) {
    const candidate = segments[idx + 1];
    if (candidate && /^[A-Za-z]{2,3}([-_][A-Za-z0-9]+)*$/.test(candidate)) {
      return candidate;
    }
  }
  // Fallback: if parent directory looks like a locale, use it
  if (segments.length >= 2) {
    const parent = segments[segments.length - 2];
    if (/^[A-Za-z]{2,3}([-_][A-Za-z0-9]+)*$/.test(parent)) {
      return parent;
    }
  }
  // Fallback to filename like en.json
  const base = path.basename(file);
  const m = base.match(/^([A-Za-z-]+)\.(json|ya?ml)$/);
  return m?.[1];
}

export async function parseDictionaries(
  root: string,
  localeGlobs: string[]
): Promise<DictionaryInfo> {
  const files = await globFiles(root, localeGlobs.length ? localeGlobs : ['**/*.{json,yaml,yml}'], [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
  ]);

  const keysByLocale = new Map<string, Set<string>>();
  const bytesByLocale = new Map<string, number>();
  if (files.length === 0) {
    return { locales: [], keysByLocale, bytesByLocale };
  }

  for (const abs of files) {
    const text = await readTextFile(abs);
    const ext = path.extname(abs).toLowerCase();
    let obj: unknown;
    try {
      if (ext === '.json') {
        obj = JSON.parse(text);
      } else if (ext === '.yaml' || ext === '.yml') {
        obj = parseYaml(text);
      } else {
        continue;
      }
    } catch {
      continue; // skip invalid files silently for MVP
    }

    const locale = inferLocaleFromPath(abs) ?? 'default';
    const keys = flattenToKeyPaths(obj);
    const keyEntries = flattenToKeyEntries(obj);
    const set = keysByLocale.get(locale) ?? new Set<string>();
    for (const k of keys) set.add(k);
    keysByLocale.set(locale, set);

    // Rough size estimation per locale: key + value JSON length
    const estimatedBytes = keyEntries.reduce((acc, [k, v]) => {
      // account for quotes and colon/comma overhead approx
      const keyLen = JSON.stringify(String(k)).length;
      const valLen = JSON.stringify(v).length;
      return acc + keyLen + 1 + valLen; // ':' accounted as 1 char
    }, 2); // final braces overhead '{}'
    const prev = bytesByLocale.get(locale) ?? 0;
    bytesByLocale.set(locale, prev + estimatedBytes);
  }

  return { locales: Array.from(keysByLocale.keys()), keysByLocale, bytesByLocale };
}


