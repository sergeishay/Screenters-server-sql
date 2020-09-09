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

eventRouter.get('/', async (req , res)=>{
    const Events = []
    let event = {}
    const ratings = await sequelize.query( `SELECT AVG(amount) AS rating, showRatingShowID FROM Show_Ratings GROUP BY Show_Ratings.showRatingShowID` )
    const events = await sequelize.query(`SELECT * FROM Events`)
    const promises = events[0].map(async query => {
        let Show = {}
        const Shows = []
        const shows = await sequelize.query(`SELECT * FROM Shows  WHERE showEventID = ${query.id}`)
        for (let show of shows[0]) {
            Show = { ...show }
            let found = ratings[0].find(r => r.showRatingShowID === show.id)
            if (found) Show['rating'] = found.rating.slice(0, 3)
            Shows.push({ ...Show })
        }
        event = { ...query }
        event['shows'] = [...Shows]
        event['hashtags'] = []
        Events.push({ ...event })
    })
    Promise.all(promises).then(result => {
        res.send(Events)
    })
    .catch((error)=>{
        console.log(error)
        return error
    })
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

    // const hashtags = await sequelize
    //     .query(
    //         `SELECT * 
    // FROM Hashtags AS h,
    // Events_Hashtags AS e
    // WHERE h.id = e.hashtagId
    // AND e.eventId = ${eventData[0][0].id}`
    //     )
    // for (let hashtag of hashtags[0]) {
    //     hashes.push(hashtag)
    // }

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
    try {
        await sequelize
            .query(
                `INSERT INTO Events VALUES(
                                         null,
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
        const EventId = await sequelize
            .query(`SELECT id FROM Events
                    WHERE Events.name = '${name}'`)




        const saved = await sequelize
            .query(
                `SELECT * FROM Events
            WHERE Events.id = ${EventId[0][0].id}`
            )
        res.send(saved[0][0])
    } catch (err) {
        res.send('saving error')
    }
})

eventRouter.post('/show', async function (req, res) {
    const {
        id,
        startTime,
        endTime,
        showEventID,
    } = req.body
    try {
        await sequelize
            .query(
                `INSERT INTO Shows VALUES(
                                         null,
                                        '${startTime}',
                                        '${endTime}',
                                         ${showEventID}
                                    )`
            )
        const saved = await sequelize
            .query(
                `SELECT * FROM Shows
                WHERE Shows.id = LAST_INSERT_ID()`
            )
        res.send(saved[0][0])
    } catch (err) {
        res.send('saving error')
    }
})

eventRouter.put('/:id', async function (req, res) {
    const { id } = req.params
    const { field } = req.body
    let { value } = req.body
    if (typeof value === 'string') value = `'${value}'`
    try {
        await sequelize
            .query(
                `UPDATE Events
        SET ${field} = ${value}
        WHERE id = ${id}`
            )
        res.send(true)
    }
    catch (err) {
        res.send(false)
    }
})

eventRouter.delete('/', async function (req, res) {
    const { eventId, showId } = req.query
    const id = eventId ? eventId : showId
    let tableName = ''
    eventId ?
        tableName = 'Events' : showId ?
            tableName = 'Shows' : tableName = 'error'
    try {
        await sequelize
            .query(
                `DELETE FROM ${tableName}
                WHERE ${tableName}.id = ${id}`
            )
        res.send(id)
    }
    catch (err) {
        res.send('delete err')
    }
})

module.exports = eventRouter


