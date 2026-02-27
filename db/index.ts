// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// We must disable prepare/prefetch for Supabase's Transaction pooler
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });