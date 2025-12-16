
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const pool: Pool = new Pool({
    connectionString,
    ssl: true,
});

export default pool;
