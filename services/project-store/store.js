import fs from 'node:fs';
import mysql from 'mysql2/promise';

export const createStore = config => {
    if (config.database !== 'microbit_projects') throw new Error('Refusing to use a non-microbit database.');
    const pool = mysql.createPool({ host: config.host, port: config.port || 3306,
        user: config.username, password: config.password, database: config.database,
        ssl: { ca: fs.readFileSync(config.caPath, 'utf8'), rejectUnauthorized: true, verifyIdentity: true },
        connectionLimit: 3, maxIdle: 1, idleTimeout: 60000, waitForConnections: true,
        queueLimit: 20, connectTimeout: 10000, enableKeepAlive: true });
    return Object.freeze({
        health: async () => { await pool.execute('SELECT 1'); },
        insert: async project => {
            await pool.execute('INSERT INTO snapshots (id, project) VALUES (?, ?)',
                [project.id, JSON.stringify(project)]);
        },
        find: async id => {
            const [rows] = await pool.execute('SELECT project FROM snapshots WHERE id = ? LIMIT 1', [id]);
            return rows.length ? (typeof rows[0].project === 'string' ? JSON.parse(rows[0].project) : rows[0].project) : undefined;
        },
        close: () => pool.end()
    });
};
