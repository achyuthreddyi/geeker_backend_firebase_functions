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
