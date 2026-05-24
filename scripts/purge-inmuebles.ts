/**
 * Elimina todos los inmuebles (y filas relacionadas con CASCADE) de la BD.
 * Uso: npx ts-node --transpile-only scripts/purge-inmuebles.ts
 */
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"'))
      || (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (process.env[key] === undefined)
      process.env[key] = val;
  }
}

async function main() {
  loadEnv(path.join(__dirname, '..', '.env'));

  const url = process.env.DATABASE_URL?.trim();
  const client = url
    ? new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
      })
    : new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT || 5432),
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'ventascasasmx',
      });

  await client.connect();
  const before = await client.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM inmuebles',
  );
  await client.query('DELETE FROM inmuebles');
  const after = await client.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM inmuebles',
  );
  await client.end();

  console.log(
    `Inmuebles eliminados: ${before.rows[0]?.count ?? '?'} → ${after.rows[0]?.count ?? '0'}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
