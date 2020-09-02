const express = require('express')
const Sequelize = require('sequelize')
const reviewRouter = express.Router()
require('dotenv').config()
const { DB_URL, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
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
})


reviewRouter.get('/:id', async function (req, res) {
    const { id } = req.params
    const { tableName } = req.body
    const table = tableName === 'Event' ? 'Show_Reviews' : tableName + '_Reviews'
    const Reviews = await sequelize
        .query(
            `SELECT * FROM ${table}
            WHERE ${table}.review${tableName}ID = ${id}`
        )
    res.send(Reviews[0])
})


reviewRouter.post('/creator', async function (req, res) {
    const {
        id,
        header,
        text,
        reviewUserID,
        reviewCreatorID,
        time,
        parentReview
    } = req.body
    const review = await sequelize
        .query(
            `INSERT INTO Creator_Reviews VALUES(
                                         ${id},
                                        '${header}',
                                        '${text}',
                                         ${reviewUserID},
                                         ${reviewCreatorID},
                                        '${time}',
                                         ${parentReview}
                                    )`
        )
    res.send(review)
})

reviewRouter.post('/show', async function (req, res) {
    const {
        id,
        header,
        text,
        reviewUserID,
        reviewShowID,
        reviewTime,
        reviewParentID,
        reviewEventID
    } = req.body
    const review = await sequelize
        .query(
            `INSERT INTO Show_Review VALUES(
                                         ${id},
                                        '${header}',
                                        '${text}',
                                         ${reviewUserID},
                                         ${reviewShowID},
                                        '${reviewTime}',
                                        ${reviewParentID},
                                        ${reviewEventID}
                                    )`
        )
    res.send(review)
})

reviewRouter.delete('/:id', async function (req, res) {
    const { id } = req.params
    const { table } = req.body
    const review = await sequelize
        .query(
            `DELETE FROM ${table}
            WHERE ${table}.id = ${id}`
        )
    res.send(review[0][0].id)
})

module.exports = reviewRouter


