import pg from "pg";
import env from "dotenv";

env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

const dbUtility = {
    checkUserByUsername: async function(username) {
        return db.query(`SELECT * FROM users WHERE username = '${username}'`);
    },
    insertNewUser: async function(username,hash) {
        return db.query(`INSERT INTO users (username,password) VALUES ('${username}','${hash}') RETURNING id`);
    },
    closeDatabase: function() {
        db.end();
    },
    checkUserById: async function(id) {
        return db.query(`SELECT * FROM users WHERE id = '${id}'`)
    }

}


export {dbUtility};

