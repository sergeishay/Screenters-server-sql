const express = require('express')
const Sequelize = require('sequelize')
const userRouter = express.Router()
const moment = require('moment')
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
    const nowYear = parseInt(moment().format().slice(0, 4))
    const nowMonth = parseInt(moment().format().slice(5, 7))
    const nowDay = parseInt(moment().format().slice(8, 10))
    const nowHour = parseInt(moment().format().slice(11, 13))
    const nowMinute = parseInt(moment().format().slice(14, 16))
    const nowSecond = parseInt(moment().format().slice(17, 19))

    const userData = await sequelize
        .query(
            `SELECT username, imageURL FROM Users
            WHERE Users.id = ${id}`
        )
    user['username'] = userData[0][0].username
    user['imageURL'] = userData[0][0].imageURL
    const shows = await sequelize.query(
        `SELECT * 
             FROM Shows AS s, User_Shows AS u
             WHERE s.id = u.showId
             AND u.userId = ${userData[0][0].id}
             GROUP BY u.userId
             ORDER BY s.startTime`
    )
    // console.log(shows[0])
    for (let show of shows[0]) {

        let showYear = parseInt(show.slice(0, 4))
        let showMonth = parseInt(show.slice(5, 7))
        let showDay = parseInt(show.slice(8, 10))
        let showHour = parseInt(show.slice(11, 13))
        let showMinute = parseInt(show.slice(14, 16))
        let showSecond = parseInt(show.slice(17, 19))

        if (
            nowYear <= showYear &&
            nowMonth <= showMonth &&
            nowDay <= showDay &&
            nowHour <= showHour &&
            nowMinute <= showMinute &&
            nowSecond <= showSecond
        ) futureShows.push(show)
        else pastShows.push(show)
    }

    user['pastShows'] = pastShows
    user['futureShows'] = futureShows
    // console.log(user)
    res.send(user)
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
    }else(res.send('saving error'))
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


