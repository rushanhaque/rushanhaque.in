import { createClient, type Client, type InValue } from '@libsql/client';

let client: Client | undefined;
export function getSqlClient() {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw Error('Private storage is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  // Vercel function filesystems are ephemeral; never silently use local storage.
  if (process.env.VERCEL && url.startsWith('file:')) throw Error('Production requires a durable remote database.');
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

class Statement {
  constructor(readonly sql: string, readonly args: InValue[] = []) {}
  bind(...args: InValue[]) { return new Statement(this.sql, args); }
  async all<T = Record<string, unknown>>() {
    const result = await getSqlClient().execute({ sql: this.sql, args: this.args });
    return { results: result.rows as unknown as T[] };
  }
  async first<T = Record<string, unknown>>() { return (await this.all<T>()).results[0] ?? null; }
  async run() { return getSqlClient().execute({ sql: this.sql, args: this.args }); }
}
export function getDatabase() {
  return {
    prepare(sql: string) { return new Statement(sql); },
    batch(statements: Statement[]) { return getSqlClient().batch(statements.map(({ sql, args }) => ({ sql, args })), 'write'); },
  };
}
