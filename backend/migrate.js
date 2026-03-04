import pool, { initDB } from './db.js';
import fs from 'fs';
import path from 'path';

async function migrateData() {
    console.log("Starting batch migration from tweets.json to PostgreSQL...");

    const isConnected = await initDB();
    if (!isConnected) {
        console.error("Migration Aborted. Ensure Docker PostgreSQL instance is running via `docker-compose up -d`.");
        process.exit(1);
    }

    const filePath = path.resolve('../src/data/tweets.json');
    if (!fs.existsSync(filePath)) {
        console.error("No tweets.json found to migrate. Run process_csv.js first.");
        process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const tweets = JSON.parse(rawData);

    let inserted = 0;
    
    // We do bulk transaction insertion for speed
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const tweet of tweets) {
            // Using parameterized queries to prevent SQL injection and parsing errors
            const queryText = `
                INSERT INTO tweets(id, text, username, label, confidence, severity, latitude, longitude)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO NOTHING
            `;
            
            const values = [
                tweet.id,
                tweet.tweet_text,
                tweet.username,
                tweet.predicted_label,
                tweet.confidence_score,
                tweet.severity_level,
                tweet.latitude,
                tweet.longitude
            ];

            await client.query(queryText, values);
            inserted++;
            
            if (inserted % 500 === 0) console.log(`Migrated ${inserted} records...`);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Success! Batch inserted ${inserted} records into PostgreSQL.`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration Failed during transaction:", e);
    } finally {
        client.release();
        process.exit(0); // Exit process
    }
}

migrateData();
