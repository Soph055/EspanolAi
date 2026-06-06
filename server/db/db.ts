import {Pool} from 'pg';


const db = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {rejectUnauthorized: false},
});

export default db;


