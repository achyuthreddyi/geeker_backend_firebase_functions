const functions = require('firebase-functions')
const {
  getAllGeeks,
  createOneGeek,
  getGeekById,
  deleteGeekById,
  commentOnGeek
} = require('./handlers/geeks')
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getUserDetails
} = require('./handlers/users')
const FBAuth = require('./utils/fbAuth')

const app = require('express')()

// users route
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user/', FBAuth, addUserDetails)
app.get('/user/', FBAuth, getUserDetails)

// geeks routes

app.get('/geeks', getAllGeeks)
app.post('/geek', FBAuth, createOneGeek)
// RD operations on the geeks
app.get('/geek/:geekId', getGeekById)
app.delete('/geek/:geekId', deleteGeekById)
// Like and unlike the geeks
app.get('/geek/:geekId', getGeekById)
// comment on a geek
app.post('/geek/:geekId/comment', FBAuth, commentOnGeek)

exports.api = functions.https.onRequest(app)
