const express = require('express')
const Sequelize = require('sequelize')
const ratingRouter = express.Router()
require('dotenv').config()
const {
    DB_URL,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_PORT
} = process.env

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS,
    {
        host: DB_URL,
        port: DB_PORT,
        logging: console.log,
        maxConcurrentQueries: 100,
        dialect: 'mysql',
        dialectOptions: {
            ssl: 'Amazon RDS'
        },
        pool: { maxConnections: 5, maxIdleTime: 30 },
        language: 'en',
    }
)

ratingRouter.get('/:id', async function (req, res) {
    const { id } = req.params
    const { tableName } = req.body
    const table = tableName === 'Event' ?
        'Show_Ratings' :
        tableName + '_Ratings'
    const Ratings = await sequelize
        .query(
            `SELECT * FROM ${table}
            WHERE ${table}.showRating${tableName}ID = ${id}`
        )
    res.send(Ratings[0])
})

ratingRouter.post('/', async function (req, res) {
    const {
        id,
        amount,
        showRatingShowID,
        showRatingUserID,
        showRatingEventID
    } = req.body
    try {
        await sequelize
            .query(
                `INSERT INTO Show_Ratings VALUES(
                                         ${id},
                                         ${amount},
                                         ${showRatingShowID},
                                         ${showRatingUserID},
                                         ${showRatingEventID}
                                    )`
            )

        const saved = await sequelize
            .query(
                `SELECT * FROM Show_Ratings
                WHERE Show_Ratings.id = ${id}`
            )
        res.send(saved[0][0])
    } catch (err) {
        res.send('saving error')
    }
})

module.exports = ratingRouter


