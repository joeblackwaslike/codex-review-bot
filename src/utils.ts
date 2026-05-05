// Simple utilities with a few intentional issues for the bot to catch

export function truncate(str: string, maxLen: number): string {
  if (str.length > maxLen) {
    return str.substring(0, maxLen) + "...";
  }
  return str;
}

export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    if (!result[k]) {
      result[k] = [];
    }
    result[k].push(item);
  }
  return result;
}

export function retry<T>(fn: () => Promise<T>, times: number): Promise<T> {
  return fn().catch((err) => {
    if (times <= 0) throw err;
    return retry(fn, times - 1);
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
