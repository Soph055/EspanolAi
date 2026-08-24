"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const db = new pg_1.Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});
exports.default = db;
//# sourceMappingURL=db.js.map