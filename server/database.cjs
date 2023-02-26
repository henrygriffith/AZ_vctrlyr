const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('data/az-canv-2022.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error(err.message)
    else {
        console.log("Connected to the database! WOO");
        console.log("");
    }
});

// db.serialize(() => {
//     console.log(db)
// })

module.exports = db