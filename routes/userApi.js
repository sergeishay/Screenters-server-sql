const express = require('express')
const Sequelize = require('sequelize')
const userRouter = express.Router()
const moment = require('moment')
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

userRouter.get('/', async function (req, res) {
    const users = await sequelize
        .query(`SELECT * FROM Users`)
    res.send(users[0])
})

userRouter.get('/:id', async function (req, res) {
    const { id } = req.params
    const user = {}
    const pastShows = []
    const futureShows = []
    const userData = await sequelize
        .query(
            `SELECT id, username, imageURL FROM Users
            WHERE Users.id = ${id}`
        )
    const shows = await sequelize
        .query(
            `SELECT * 
            FROM Shows AS s, User_Shows AS u
            WHERE s.id = u.showId
            AND u.userId = ${userData[0][0].id}`
        )
    for (let show of shows[0]) {
        if (moment() < moment(show.startTime).tz("Europe/Paris"))
            futureShows.push(show)
        else pastShows.push(show)
    }
    user['username'] = userData[0][0].username
    user['imageURL'] = userData[0][0].imageURL
    user['pastShows'] = pastShows
    user['futureShows'] = futureShows
    res.send(user)
})

userRouter.post('/show', async function (req, res) {
    const { userID, showID } = req.body
    const userShow = await sequelize
        .query(
            `INSERT INTO User_Shows VALUES(
                                ${userID},
                                ${showID}
                            )`
        )
    res.send(userShow)
})


userRouter.post('/', async function (req, res) {
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
    const isUserSaved = await sequelize
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

    if (isUserSaved[1]) {
        const user = await sequelize
            .query(
                `SELECT * FROM Users
            WHERE Users.id = ${id}`
            )
        res.send(user[0][0])
    } else (res.send('saving error'))
})

userRouter.put('/:id', async function (req, res) {
    const { field, value } = req.body
    const { id } = req.params
    const user = await sequelize
        .query(
            `UPDATE Users
            SET ${field} = '${value}'
            WHERE Users.id = ${id}`
        )
    res.send(user)
})

userRouter.delete('/:id', async function (req, res) {
    const { id } = req.params
    const user = await sequelize
        .query(
            `DELETE FROM Users
            WHERE Users.id = ${id}`
        )
    res.send(user)
})

module.exports = userRouter


