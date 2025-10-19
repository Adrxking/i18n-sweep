<div align="center">

# i18n-sweep

Lightweight CLI + API to detect unused and missing i18n keys in your codebase.

</div>

## Features

- Scan translation dictionaries (JSON/YAML) and flatten nested keys (a.b.c)
- Parse source files (Vue SFC, JS/TS/JSX/TSX) to find i18n usages
- Classify findings as: unused or missing (dynamic prefixes se usan internamente para suprimir falsos positivos)
- Output to console or JSON report

## Install

Use directly with npx (no install):

```bash
npx i18n-sweep scan --root . --locales "src/locales/**/*.{json,yaml,yml}"
```

Or add to your project:

```bash
npm i -D i18n-sweep
```

## CLI usage

```bash
i18n-sweep scan \
  --root . \
  --locales "src/locales/**/*.{json,yaml,yml}" \
  --report json \
  --out report.json
```

Options:

- `--root <path>`: project root (default: `.`)
- `--locales <globs>`: comma-separated globs to dictionary files
- `--report <console|json>`: output type (default: `console`)
- `--out <file>`: JSON report output path
- `--i18n-fns <names>`: comma-separated custom i18n function names (e.g., `translate,tr,i18n.translate`)

Console output example:

```
i18n-sweep: total=123 used=100 unused=18 missing=5 kbSaved=12.4
```

JSON output example:

```json
{
  "summary": { "totalKeys": 1200, "used": 800, "unused": 400, "missing": 50, "kbSaved": 120.5 },
  "locales": ["en","es"],
  "unused": ["specie.lion"],
  "missing": []
}
```

## Programmatic API (JS/TS)

```ts
import { scan } from 'i18n-sweep';
const report = await scan({
  root: '.',
  locales: ['src/locales/**/*.{json,yaml,yml}'],
  report: 'json',
  out: 'report.json'
});
```

## Notes & limitations

- Dynamic keys (template literals or concatenation) are used internally as prefix heuristics to avoid false positives. Keys covered by a dynamic prefix are not reported as unused.

## License

MIT
