export function omitKeys<T extends Record<string, unknown>, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K
): Omit<T, K[number]> {
  const cloned = { ...obj };

  for (const key of keys) {
    delete cloned[key];
  }

  return cloned;
}
