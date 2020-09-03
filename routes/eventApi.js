const express = require('express')
const Sequelize = require('sequelize')
const eventRouter = express.Router()
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

eventRouter.get('/', async function (req, res) {
    const Events = []
    const event = {}
    const hashes = []
    const events = await sequelize
        .query(`SELECT * FROM Events`)
    for (let Event of events[0]) {
        const shows = await sequelize
            .query(
                `SELECT sh.id AS id, startTime, endTime, amount
            FROM Shows AS sh, Show_Ratings AS sr
            WHERE sh.showEventID = ${Event.id}`
            )
        const hashtags = await sequelize
            .query(
                `SELECT * 
            FROM Hashtags AS h,
            Events_Hashtags AS e
            WHERE h.id = e.hashtagId
            AND e.eventId = ${Event.id}`
            )
        for (let hashtag of hashtags[0]) {
            hashes.push(hashtag)
        }
        event['event'] = { ...Event }
        event.event['shows'] = [...shows[0]]
        event.event['hashtags'] = [...hashes]
        Events.push({ ...event })
    }
    res.send(Events)
})

eventRouter.get('/:id', async function (req, res) {
    const { id } = req.params
    const event = {}
    const hashes = []
    const eventData = await sequelize
        .query(
            `SELECT * FROM Events
            WHERE Events.id = ${id}`
        )
    const shows = await sequelize
        .query(
            `SELECT * 
            FROM Shows, Show_Ratings
            WHERE Shows.showEventID = ${eventData[0][0].id}`
        )
    const hashtags = await sequelize
        .query(
            `SELECT * 
            FROM Hashtags AS h,
                 Events_Hashtags AS e
            WHERE h.id = e.hashtagId
            AND e.eventId = ${eventData[0][0].id}`
        )
    for (let hashtag of hashtags[0]) {
        hashes.push(hashtag)
    }
    event['event'] = eventData[0][0]
    event.event['shows'] = [...shows[0]]
    event.event['hashtags'] = hashes
    res.send(event)
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
        categoryID,
        coverImgURL,
        hashtags
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
                                         ${categoryID},
                                        '${coverImgURL}'
                                    )`
        )
    for (let hashtag of hashtags) {
        let hashtagID = await sequelize
            .query(`SELECT id FROM Hashtags
                Where Hashtags.name = '${hashtag}'`)
        if (!hashtagID[1].length) {
            let hash = await sequelize
                .query(`INSERT INTO Hashtags VALUES(null,'${hashtag}')`)
            await sequelize.query(
                `INSERT INTO Events_Hashtags VALUES(
                                    ${event[0]},
                                    ${hash[0]}
                                )`
            )
        } else {
            await sequelize.query(
                `INSERT INTO Events_Hashtags VALUES(
                    ${event[0]},
                    ${hashtagID[0]}
                    )`
            )
        }
    }
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
    res.send(show)
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


