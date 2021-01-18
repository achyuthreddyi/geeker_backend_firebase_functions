const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const app = require('express')()

const firebaseConfig = {
  apiKey: 'AIzaSyDxn3nEML0VpeSKMPeVaGMToEGaWjY9Lxk',
  authDomain: 'geeker-301913.firebaseapp.com',
  projectId: 'geeker-301913',
  storageBucket: 'geeker-301913.appspot.com',
  messagingSenderId: '288453501250',
  appId: '1:288453501250:web:5451d42a5b733faa99e8db'
}

const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)

const db = admin.firestore()

app.get('/geeks', (request, response) => {
  db.collection('geek')
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

  db.collection('geek')
    .add(newGeek)
    .then(doc => {
      response.json({ message: `document ${doc.id} created succcessfully!!` })
    })
    .catch(err => {
      response.status(500).json({ error: 'something went wrong' })
      console.log(err)
    })
})
// signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }
  // TODO: validate the data
  let token, userId
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      console.log('coming in the .then of hte doc fiel', doc)
      if (doc.exists) {
        console.log('coming inside the if block ')
        return res.status(400).json({ handle: 'this handle is already taken ' })
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then(idtoken => {
      token = idtoken
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      }
      return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' })
      }
      return res.status(500).json({ error: err.code })
    })
})

exports.api = functions.https.onRequest(app)
