const express = require('express')
const Sequelize = require('sequelize')
const eventRouter = express.Router()
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

eventRouter.post('/event', async function (req, res) {
    const {
        id,
        name,
        description,
        imageURL,
        videoURL,
        price,
        creatorID,
        category
    } = req.body
    const event = await sequelize
        .query(
            `INSERT INTO Events VALUES(
                                         ${id},
                                        '${name}',
                                        '${description}',
                                        '${imageURL}',
                                        '${videoURL}',
                                         ${price},
                                         ${creatorID},
                                         ${category}
                                    )`
        )
    res.send(event)
})

eventRouter.post('/show', async function (req, res) {
    const {
        id,
        startTime,
        endTime,
        showEventID,
    } = req.body
    const show = await sequelize
        .query(
            `INSERT INTO Shows VALUES(
                                         ${id},
                                        '${startTime}',
                                        '${endTime}',
                                         ${showEventID}
                                    )`
        )
    res.send(show[0])
})

eventRouter.put('/:id', async function (req, res) {
    const { field, value } = req.body
    const { id } = req.params
    const event = await sequelize
        .query(
            `UPDATE Events
        SET ${field} = '${value}'
        WHERE Events.id = ${id}`
        )
    res.send(event)
})

eventRouter.delete('/:id', async function (req, res) {
    const { id } = req.params
    const { table } = req.body
    const event = await sequelize
        .query(
            `DELETE FROM ${table}
                WHERE ${table}.id = ${id}`
        )
    res.send(event[0][0].id)
})

module.exports = eventRouter


