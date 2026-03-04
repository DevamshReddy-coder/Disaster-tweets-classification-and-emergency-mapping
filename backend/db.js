import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'disastersense',
  password: process.env.DB_PASSWORD || 'password123',
  port: process.env.DB_PORT || 5432,
});

export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                role VARCHAR(50) DEFAULT 'Viewer',
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tweets (
                id VARCHAR(50) PRIMARY KEY,
                text TEXT NOT NULL,
                username VARCHAR(100),
                label VARCHAR(50),
                confidence FLOAT,
                severity INT,
                latitude FLOAT,
                longitude FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id VARCHAR(50) PRIMARY KEY,
                region VARCHAR(100),
                type VARCHAR(50),
                severity INT,
                status VARCHAR(50) DEFAULT 'active',
                message TEXT,
                tweet_id VARCHAR(50) REFERENCES tweets(id),
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ [PostgreSQL] Database tables initialized successfully.');
        return true;
    } catch (err) {
        console.error('❌ [PostgreSQL] Connection Failed. Using Memory Fallback.', err.message);
        return false;
    }
}

export default pool;
