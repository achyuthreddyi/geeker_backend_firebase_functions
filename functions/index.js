const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello world')
})

exports.getGeeks = functions.https.onRequest((request, response) => {
  admin
    .firestore()
    .collection('geek')
    .get()
    .then(data => {
      const geeks = []
      data.forEach(doc => {
        geeks.push(doc.data())
      })
      return response.json(geeks)
    })
    .catch(err => console.error(err))
})

exports.createGeeek = functions.https.onRequest((request, response) => {
  if (request.method !== 'POST') {
    return response.status(400).json({ error: 'this method is not valid' })
  }
  const newGeek = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
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
