const express = require("express");
const cors = require('cors')
const app = express();

const db = require('./database.cjs')
const HTTP_PORT = 8000;

// Middleware
app.use(cors())

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`)
})

app.get("/conthist/vanids", (req, res, next) => {
    const sql = "SELECT * FROM conthist LIMIT 15"
    db.all(sql, (err, rows) => {
        if (err) {
            res.status(404).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    })
    
})

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({
        "message": "Ok"
    })
})

// Default response for any other request
app.use(function(req, res) {
    res.status(404);
})