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

app.get("/conthist", (req, res, next) => {
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

app.get("/repvoters", (req, res, next) => {
    const sql = "SELECT * FROM repvoters LIMIT 15"
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

app.get("/survresp", (req, res, next) => {
    const sql = "SELECT * FROM survresp LIMIT 15"
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
app.get("/univoters", (req, res, next) => {
    const sql = `
        SELECT 
            UPPER(precinct) AS pname, 
            ROUND(AVG(CASE WHEN race!='Caucasian' THEN 1.0 ELSE 0 END), 2) AS pocPerc, 
            ROUND(AVG(vci), 2) AS avg_vci, COUNT(vanid) AS pop, 
            con_dist AS CD, 
            hse_dist AS LD, 
            UPPER(county) AS county

        FROM univoters
        GROUP BY pname
        `
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