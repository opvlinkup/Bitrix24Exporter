import query from "../repository/db.js";

console.log("Testing PostgreSQL connection...");

const res = await query("SELECT NOW()");

console.log("Connected OK:", res.rows[0]);

process.exit(0);
