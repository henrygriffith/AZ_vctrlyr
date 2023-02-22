const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();

const db = require('./database.cjs')
const HTTP_PORT = 8000;

// Middleware
app.use(cors())
app.use(bodyParser.json())

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`)
})

// All routes get sent to root endpoint with SQL query as part of the request body.
app.post("/", (req, res, next) => {
    const {sql} = req.body
    db.all(sql, (err, rows) => {
        if (err) {
            console.log(sql)
            res.status(404).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    })
})

// Default response for any other request
app.use(function(req, res) {
    res.status(404);
})