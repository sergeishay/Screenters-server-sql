const express = require('express')
const Sequelize = require('sequelize')
const path = require('path')
const app = express()
// const api = require('./server/api')
require('dotenv').config()

const { DB_URL, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env
const sequelize = new Sequelize(DB_NAME,DB_USER,DB_PASS,{
    host: DB_URL,
    port: DB_PORT,
    logging: console.log,
    maxConcurrentQueries: 100,
    dialect: 'mysql',
    dialectOptions: {
        ssl: 'Amazon RDS'
    },
    pool: {maxConnections: 5, maxIdleTime: 30},
    language: 'en',
})

sequelize.query('CREATE TABLE test(id INT NOT NULL PRIMARY KEY, name VARCHAR(20))')

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next()
})

// app.use('/', api)
app.listen(8080, () => console.log("server up and running on port 8080"))