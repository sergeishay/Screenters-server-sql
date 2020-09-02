const express = require('express')
const Sequelize = require('sequelize')
const path = require('path')
const app = express()
// const api = require('./server/api')
require('dotenv').config()

const { DB_URL, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_URL,
  port: DB_PORT,
  logging: console.log,
  maxConcurrentQueries: 100,
  dialect: 'mysql',
  dialectOptions: {
    ssl: 'Amazon RDS',
  },
  pool: { maxConnections: 5, maxIdleTime: 30 },
  language: 'en',
})

const dummyUsers = require('./dummyUsers')
const dummyCreators = require('./dummyCreators')
console.log(dummyCreators)

const seedUsers = async dummyUsers => {
  for (user of dummyUsers) {
    const results = await sequelize.query(
      `INSERT INTO screenterMainDB.Users (id,firstName,lastName,username,imageURL,videoURL,email,birthday,memberSince,gender,about,userRole,isAuthorized,phone) VALUES (NULL,'${user.firstName}','${user.lastName}','${user.username}','${user.imageURL}',NULL,'${user.email}',NULL,NOW(),'${user.gender}',NULL,'CREATOR',NULL,NULL)`
    )
    console.log(results)
  }
}

const seedCreators = async dummyCreators => {
  for (user of dummyCreators) {
    const isAuthorized = Math.floor(Math.random() * 1)
    const results = await sequelize.query(
      `INSERT INTO screenterMainDB.Users (id,firstName,lastName,username,imageURL,videoURL,email,birthday,memberSince,gender,about,userRole,isAuthorized,phone) VALUES (NULL,'${user.firstName}','${user.lastName}','${user.username}','${user.imageURL}','DLIv5F-dLrY','${user.email}',${user.birthday},${user.memberSince},'${user.gender}','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popu','CREATOR',${isAuthorized},'0528228640')`
    )
    console.log(results)
  }
}

const seedCategories = async categoryArray => {
  for (user of dummyCreators) {
    const isAuthorized = Math.floor(Math.random() * 1)
    const results = await sequelize.query(
      `INSERT INTO screenterMainDB.Users (id,firstName,lastName,username,imageURL,videoURL,email,birthday,memberSince,gender,about,userRole,isAuthorized,phone) VALUES (NULL,'${user.firstName}','${user.lastName}','${user.username}','${user.imageURL}','DLIv5F-dLrY','${user.email}',${user.birthday},${user.memberSince},'${user.gender}','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popu','CREATOR',${isAuthorized},'0528228640')`
    )
    console.log(results)
  }
}

const seedDB = async () => {
  // await seedUsers(dummyUsers)
  //await seedCreators(dummyCreators)
  await seedCategories()
}
seedDB()
