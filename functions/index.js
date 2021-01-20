const functions = require('firebase-functions')
const { getAllGeeks, createOneGeek } = require('./handlers/geeks')
const { signUp, login } = require('./handlers/users')
const FBAuth = require('./utils/fbAuth')

const app = require('express')()

// users route
app.post('/signup', signUp)
app.post('/login', login)

// geeks routes

app.get('/geeks', getAllGeeks)
app.post('/geeks', FBAuth, createOneGeek)

exports.api = functions.https.onRequest(app)
