const express = require('express')
const Sequelize = require('sequelize')
const creatorRouter = express.Router()
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

creatorRouter.get('/', async function (req, res) {
    const { isEvents, isShows } = req.query
    if (isEvents && isShows) {
        const creators = await sequelize
            .query(
                `SELECT *
                    FROM Users AS u,
                         Events AS e,
                         Shows AS s
                    WHERE s.eventsId = e.id
                    AND e.creatorId = u.id`
            )
        res.send(creators[0])
    }
    else if (isEvents) {
        const creators = await sequelize
            .query(
                `SELECT *
                     FROM Users AS u,
                          Events AS e
                     WHERE e.creatorId = u.id`
            )
        res.send(creators[0])
    }
    else {
        const creators = await sequelize
            .query(
                `SELECT *
                    FROM Users
                    WHERE userRole = 'Creator'
                    AND id NOT IN(SELECT creatorId
                                FROM Events)`
            )
        res.send(creators[0])
    }
})

creatorRouter.get('/:id', async function (req, res) {
    const { id } = req.params
    const creator = {}
    const creatorData = await sequelize
        .query(
            `SELECT * FROM Users
            WHERE Users.id = ${id}`
        )

    const creatorEvents = await sequelize
        .query(
            `SELECT * FROM Events
            WHERE creatorId = ${id}`
        )

    const creatorShows = await sequelize
        .query(
            `SELECT * FROM Shows
                GROUP BY eventId
                WHERE eventId = '${creatorEvents[0][0].id}'`
        )
    creator['creatorData'] = creatorData
    creator['creatorEvents'] = creatorEvents[0]
    for (let event of creator.creatorEvents) {
        event['shows'] = creatorShows[0].filter(s => s.eventId === event.id)
    }
    res.send(creator)
})

creatorRouter.get('/general/details', async function (req, res) {
    const general = {}
    const categories = await sequelize
        .query(
            `SELECT * FROM Categories`
        )
    const ratings = await sequelize
        .query(
            `SELECT * FROM Show_Ratings`
        )
        general['categories'] = [...categories[0]]
        general['ratings'] = [...ratings[0]]
    res.send(general)
})

creatorRouter.post('/', async function (req, res) {
    const {
        id,
        firstName,
        lastName,
        username,
        imageURL,
        videoURL,
        email,
        birthday,
        memberSince,
        gender,
        about,
        userRole,
        isAuthorized,
        phone
    } = req.body
    const isCreatorSaved = await sequelize
        .query(
            `INSERT INTO Users VALUES(
                                         ${id},
                                        '${firstName}',
                                        '${lastName}',
                                        '${username}',
                                        '${imageURL}',
                                        '${videoURL}',
                                        '${email}',
                                        '${birthday}',                                                     
                                        '${memberSince}',
                                        '${gender}',
                                        '${about}',
                                        '${userRole}',
                                         ${isAuthorized},
                                        '${phone}'
                                    )`
        )
        if (isCreatorSaved[1].length) {
            const saved = await sequelize
                .query(
                    `SELECT * FROM Users
                    WHERE Users.id = ${isCreatorSaved[0]}`
                )
            res.send(saved[0][0])
        } else res.send('saving error')   
})

creatorRouter.put('/:id', async function (req, res) {
    const { field, value } = req.body
    const { id } = req.params
    if (typeof value === 'string') value = `'${value}'`

    const user = await sequelize
        .query(
            `UPDATE Users
            SET ${field} = ${value}
            WHERE Users.id = ${id}`
        )
    res.send(user)
})

creatorRouter.delete('/:id', async function (req, res) {
    const { id } = req.params
    const user = await sequelize
        .query(
            `DELETE FROM Users
            WHERE Users.id = ${id}`
        )
    res.send(user)
})

module.exports = creatorRouter


