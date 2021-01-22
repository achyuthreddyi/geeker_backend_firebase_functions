const functions = require('firebase-functions')
const {
  getAllGeeks,
  createOneGeek,
  getGeekById,
  deleteGeekById,
  commentOnGeek,
  likeGeekById,
  disLikeGeekById
} = require('./handlers/geeks')
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getMyDetails,
  getUserDetailsByHandle,
  markNotificationsRead
} = require('./handlers/users')
const { db } = require('./utils/admin')
const FBAuth = require('./utils/fbAuth')

const app = require('express')()

// users route
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user/', FBAuth, addUserDetails)
app.get('/user/', FBAuth, getMyDetails)
app.get('/user/:handle', getUserDetailsByHandle)
app.post('/notifications', markNotificationsRead)

// geeks routes
app.get('/geeks', getAllGeeks)
app.post('/geeks', FBAuth, createOneGeek)

// RD operations on the geeks
app.get('/geek/:geekId', getGeekById)
app.delete('/geek/:geekId', deleteGeekById)

// comment on a geek
app.post('/geek/:geekId/comment', FBAuth, commentOnGeek)

// Like and unlike the geeks
app.get('/geek/:geekId/like', FBAuth, likeGeekById)
app.get('/geek/:geekId/dislike', FBAuth, disLikeGeekById)

exports.api = functions.https.onRequest(app)

exports.createNotificationOnLike = functions.firestore
  .document('likes/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/geek/${snapshot.data().geekId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toDateString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            geekId: doc.id
          })
        }
      })
      .catch(err => {
        console.error(err)
      })
  })

exports.deleteNotificationOnDisLike = functions.firestore
  .document('dislikes/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        console.log('notification delete')
      })
      .catch(err => {
        console.error(err)
      })
  })

exports.createNotificationOnComment = functions.firestore
  .document('comments/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/geek/${snapshot.data().geekId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toDateString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            geekId: doc.id
          })
        }
      })
      .catch(err => {
        console.error(err)
      })
  })
