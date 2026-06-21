import { drizzle } from 'drizzle-orm/neon-http';

const connectionString =
  process.env.NEON_DB_CONNECTION_STRING ||
  process.env.NEXT_PUBLIC_NEON_DB_CONNECTION_STRING;

export const db = drizzle(connectionString!);
