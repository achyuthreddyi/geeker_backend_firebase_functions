const functions = require('firebase-functions')
const { getAllGeeks, createOneGeek } = require('./handlers/geeks')
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
app.post('/geeks', FBAuth, createOneGeek)

exports.api = functions.https.onRequest(app)
