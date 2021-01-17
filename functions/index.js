const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const express = require('express')
const app = express()

app.get('/geeks', (request, response) => {
  admin
    .firestore()
    .collection('geek')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      const geeks = []
      data.forEach(doc => {
        console.log('doc object', doc)
        geeks.push({
          geekId: doc.id,
          ...doc.data()
        })
      })
      return response.json(geeks)
    })
    .catch(err => console.error(err))
})

app.post('/geeks', (request, response) => {
  const newGeek = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: new Date().toISOString()
  }

  admin
    .firestore()
    .collection('geek')
    .add(newGeek)
    .then(doc => {
      response.json({ message: `document ${doc.id} created succcessfully!!` })
    })
    .catch(err => {
      response.status(500).json({ error: 'something went wrong' })
      console.log(err)
    })
})
exports.api = functions.https.onRequest(app)
