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
    let event = {}
    const hashes = []
    const events = await sequelize
        .query(`SELECT * FROM Events`)
    // res.send(events[0])
    for (let Event of events[0]) {
        let Show = {}
        const Shows = []
        const shows = await sequelize
            .query(
                `SELECT *
            FROM Shows 
            WHERE showEventID = ${Event.id}`
            )
        const ratings = await sequelize
            .query(
                `SELECT AVG(amount) AS rating, showRatingShowID
            FROM Show_Ratings
            GROUP BY Show_Ratings.showRatingShowID`
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

        for (let show of shows[0]) {
            Show = { ...show }
            let found = ratings[0].find(r => r.showRatingShowID === show.id)
            if (found) Show['rating'] = found.rating.slice(0, 3)
            Shows.push({ ...Show })
        }

        event = { ...Event }
        event['shows'] = [...Shows]
        event['hashtags'] = [...hashes]
        Events.push({ ...event })
    }
    res.send(Events)

})

eventRouter.get('/:id', async function (req, res) {
    const { id } = req.params
    let event = {}
    const hashes = []
    let Show = {}
    const Shows = []
    const eventData = await sequelize
        .query(
            `SELECT * FROM Events
            WHERE Events.id = ${id}`
        )
    const shows = await sequelize
        .query(
            `SELECT *
    FROM Shows 
    WHERE showEventID = ${eventData[0][0].id}`
        )
    const ratings = await sequelize
        .query(
            `SELECT AVG(amount) AS rating, showRatingShowID
    FROM Show_Ratings
    GROUP BY Show_Ratings.showRatingShowID`
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

    for (let show of shows[0]) {
        Show = { ...show }
        let found = ratings[0].find(r => r.showRatingShowID === show.id)
        if (found) Show['rating'] = found.rating.slice(0, 3)
        Shows.push({ ...Show })
    }

    event = eventData[0][0]
    event['shows'] = [...Shows]
    event['hashtags'] = [...hashes]
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
    const isEventSaved = await sequelize
        .query(
            `INSERT INTO Events VALUES(
                                         ${id},
                                        '${name}',
                                        '${description}',
                                        '${imageURL}',
                                        '${videoURL}',
                                         ${price},
                                        '${creatorID}',
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

    if (isEventSaved[1] == 1) {
        const saved = await sequelize
            .query(
                `SELECT * FROM Events
            WHERE Events.id = ${isEventSaved[0]}`
            )

        res.send(saved[0][0])
    } else res.send('saving error')
})

eventRouter.post('/show', async function (req, res) {
    const {
        id,
        startTime,
        endTime,
        showEventID,
    } = req.body
    const isShowSaved = await sequelize
        .query(
            `INSERT INTO Shows VALUES(
                                         ${id},
                                        '${startTime}',
                                        '${endTime}',
                                         ${showEventID}
                                    )`
        )
    if (isShowSaved[1] == 1) {
        const saved = await sequelize
            .query(
                `SELECT * FROM Shows
                WHERE Shows.id = ${isShowSaved[0]}`
            )
        res.send(saved[0][0])
    } else res.send('saving error')
})

eventRouter.put('/:id', async function (req, res) {
    const { field, value } = req.body
    const { id } = req.params
    if (typeof value === 'string') value = `'${value}'`

    const event = await sequelize
        .query(
            `UPDATE Events
        SET ${field} = ${value}
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


