const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/gi, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

const transformKeysToCamelCase = <
  T extends Record<string, unknown> | Array<Record<string, unknown>>,
>(
  obj: T
): T => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeysToCamelCase(item)) as unknown as T;
  } else if (typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        const camelCaseKey = toCamelCase(key);

        // If the value is an object or array, recursively transform keys
        if (value !== null && typeof value === 'object') {
          acc[camelCaseKey] = transformKeysToCamelCase(value as T);
          return acc;
        } else {
          acc[camelCaseKey] = value;
          return acc;
        }
      },
      {} as Record<string, unknown>
    ) as T;
  }
  return obj;
};

export default transformKeysToCamelCase;
