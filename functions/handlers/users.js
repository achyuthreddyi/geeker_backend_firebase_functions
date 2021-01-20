const config = require('../utils/config')
const { db, admin } = require('../utils/admin')
const { validateSignUpData, validateLoginData } = require('../utils/validators')
const BusBoy = require('busboy')
const path = require('path')
const os = require('os')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const firebase = require('firebase')
firebase.initializeApp(config)

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  const { valid, errors } = validateSignUpData(newUser)

  if (!valid) return res.status(400).json(errors)

  const noImage = 'sample.png'

  // TODO: validate the data
  let token, userId
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImage}?alt=media`,
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
}

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  const { valid, errors } = validateLoginData(user)

  if (!valid) return res.status(400).json(errors)

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken()
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({ password: 'Incorrect password' })
      }
      res.status(500).json({ error: err.code })
    })
}

exports.uploadImage = (req, res) => {
  const busybox = new BusBoy({ headers: req.headers })
  let imageTobeUploaded = {}
  busybox.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log('mimetype is ', mimetype)
    if (
      mimetype !== 'image/jpeg' &&
      mimetype !== 'image/jpg' &&
      mimetype !== 'image/png'
    ) {
      return res.status(400).json({ error: 'Wrong file type submitter' })
    }
    const imageExtension = fieldname.split('.')[fieldname.split('.').length - 1]
    const imageFileName = `${uuidv4()}.${imageExtension}`
    const filepath = path.join(os.tmpdir(), imageFileName)
    imageTobeUploaded = { filepath, mimetype, imageFileName }
    file.pipe(fs.createWriteStream(filepath))
  })
  busybox.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageTobeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageTobeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageTobeUploaded.imageFileName}?alt=media`
        return db
          .doc(`/users/${req.user.handle}`)
          .update({ imageUrl: imageUrl })
      })
      .then(() => {
        return res.json({ message: 'image uploaded successfully' })
      })
      .catch(err => {
        console.error(err)
        res.status(500).json({ error: err.code })
      })
  })
  busybox.end(req.rawBody)
}
