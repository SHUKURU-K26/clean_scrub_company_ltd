// Recursively converts snake_case keys (FastAPI's output) to camelCase,
// so existing components (written against unitPrice, reorderLevel, etc.)
// work unchanged against real API responses.
function toCamel(key) {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function camelize(data) {
  if (Array.isArray(data)) return data.map(camelize);
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [toCamel(k), camelize(v)]));
  }
  return data;
}

// Reverse direction — used when sending camelCase form data to the API.
function toSnake(key) {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function snakeize(data) {
  if (Array.isArray(data)) return data.map(snakeize);
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [toSnake(k), snakeize(v)]));
  }
  return data;
}