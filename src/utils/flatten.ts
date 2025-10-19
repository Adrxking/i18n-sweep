export function flattenToKeyPaths(
  input: unknown,
  parentPath: string = ''
): string[] {
  if (input === null || input === undefined) {
    return [];
  }
  if (typeof input !== 'object') {
    return parentPath ? [parentPath] : [];
  }

  const result: string[] = [];
  const record = input as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    const nextPath = parentPath ? `${parentPath}.${key}` : key;
    if (value && typeof value === 'object') {
      const nested = flattenToKeyPaths(value, nextPath);
      if (nested.length === 0) {
        result.push(nextPath);
      } else {
        result.push(...nested);
      }
    } else {
      result.push(nextPath);
    }
  }
  return result;
}

export function flattenToKeyEntries(
  input: unknown,
  parentPath: string = ''
): Array<[string, unknown]> {
  if (input === null || input === undefined) {
    return [];
  }
  if (typeof input !== 'object') {
    return parentPath ? [[parentPath, input]] : [];
  }
  const entries: Array<[string, unknown]> = [];
  const record = input as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    const nextPath = parentPath ? `${parentPath}.${key}` : key;
    if (value && typeof value === 'object') {
      const nested = flattenToKeyEntries(value, nextPath);
      entries.push(...nested);
    } else {
      entries.push([nextPath, value]);
    }
  }
  return entries;
}


