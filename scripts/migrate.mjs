import { createClient } from '@libsql/client';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
if (!url) throw Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before migrating.');
if (process.env.VERCEL && url.startsWith('file:')) throw Error('Vercel requires remote storage.');
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
try {
  await db.execute('CREATE TABLE IF NOT EXISTS portfolio_migrations (name TEXT PRIMARY KEY, hash TEXT NOT NULL)');
  for (const name of readdirSync('drizzle').filter(name => name.endsWith('.sql')).sort()) {
    const source = readFileSync(`drizzle/${name}`, 'utf8');
    const hash = createHash('sha256').update(source).digest('hex');
    const previous = await db.execute({ sql: 'SELECT hash FROM portfolio_migrations WHERE name = ?', args: [name] });
    if (previous.rows.length) {
      if (previous.rows[0].hash !== hash) throw Error(`Applied migration changed: ${name}`);
      continue;
    }
    const statements = source.split('--> statement-breakpoint').map(sql => sql.trim()).filter(Boolean);
    await db.batch([...statements.map(sql => ({ sql, args: [] })), { sql: 'INSERT INTO portfolio_migrations (name, hash) VALUES (?, ?)', args: [name, hash] }], 'write');
    console.log(`Applied ${name}`);
  }
} finally { db.close(); }
