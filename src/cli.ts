#!/usr/bin/env node
import { cac } from 'cac';
import { scan } from './index';

const cli = cac('i18n-sweep');

function splitGlobListPreservingBraces(input: string): string[] {
  const results: string[] = [];
  let current = '';
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }
    if (ch === '\\') {
      current += ch;
      escapeNext = true;
      continue;
    }

    // Quote handling
    if (!inDouble && !inBacktick && ch === "'" && !inSingle) {
      inSingle = true;
      current += ch;
      continue;
    } else if (inSingle && ch === "'") {
      inSingle = false;
      current += ch;
      continue;
    }
    if (!inSingle && !inBacktick && ch === '"' && !inDouble) {
      inDouble = true;
      current += ch;
      continue;
    } else if (inDouble && ch === '"') {
      inDouble = false;
      current += ch;
      continue;
    }
    if (!inSingle && !inDouble && ch === '`' && !inBacktick) {
      inBacktick = true;
      current += ch;
      continue;
    } else if (inBacktick && ch === '`') {
      inBacktick = false;
      current += ch;
      continue;
    }

    // Depth tracking only when not inside quotes
    if (!inSingle && !inDouble && !inBacktick) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
      else if (ch === '[') bracketDepth++;
      else if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1);
      else if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);

      if (ch === ',' && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
        const piece = current.trim();
        if (piece) results.push(piece);
        current = '';
        continue;
      }
    }

    current += ch;
  }
  const last = current.trim();
  if (last) results.push(last);
  return results;
}

cli
  .command('scan', 'Scan project source and locale dictionaries')
  .option('--root <path>', 'Project root', { default: '.' })
  .option(
    '--locales <globs>',
    'Comma-separated dictionary globs',
    { default: 'src/locales/**/*.{json,yaml,yml}' }
  )
  .option('--report <type>', 'console|json', { default: 'console' })
  .option('--out <file>', 'Output file path for JSON report')
  .option('--i18n-fns <names>', 'Comma-separated i18n function names (e.g., translate,tr)')
  .action(async (options) => {
    const defaultOut = options.report === 'json' && !options.out ? 'i18n-sweep-report.json' : options.out;
    const rawLocales: string[] = Array.isArray(options.locales)
      ? options.locales
      : [String(options.locales)];
    const locales = rawLocales
      .flatMap((entry: string) => splitGlobListPreservingBraces(entry))
      .filter(Boolean)
      .flatMap((g: string) => {
        // If user already provided a glob (wildcards or brace patterns), use as-is
        if (['*', '?', '{', '['].some((ch) => g.includes(ch))) return [g];
        // If it's a file with known extension, use as-is
        if(/\.(json|ya?ml)$/i.test(g)) return [g];
        // Otherwise treat as directory
        return [`${g}/**/*.{json,yaml,yml}`, `${g}/**/*.json`];
      });
    const i18nFunctions = options['i18n-fns'] ? String(options['i18n-fns']).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined;
    const report = await scan({
      root: options.root,
      locales,
      report: options.report,
      out: defaultOut,
      i18nFunctions
    });
    if (options.report === 'json') {
      console.log(`JSON report written to: ${defaultOut}`);
    }
    return report;
  });

cli.help();
cli.parse();


