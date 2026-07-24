import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as migrationSchema from '../../../migrations/schema';
import * as relationSchema from './schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.log('🔴 no database URL');
}

const client = postgres(process.env.DATABASE_URL as string, { max: 1 });

const schema = {
  ...migrationSchema,
  ...relationSchema,
};

const db = drizzle(client, { schema });

// const migrateDb = async () => {
//   try {
//     console.log('🟠 Migrating client');
//     await migrate(db, { migrationsFolder: 'migrations' });
//     console.log('🟢 Successfully Migrated');
//   } catch (error) {
//     console.log('🔴 Error Migrating client', error);
//   }
// };

// migrateDb();

export default db;