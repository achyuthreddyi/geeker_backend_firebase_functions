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
// const { db } = require('./utils/admin')
const FBAuth = require('./utils/fbAuth')

const app = require('express')()

const cors = require('cors')

app.use(cors())

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
app.get('/', (req, res) => {
  res.send('hey it is working')
})

exports.api = functions.https.onRequest(app)

// exports.createNotificationOnLike = functions.firestore
//   .document('/likes/{id}')
//   .onCreate((snapshot, context) => {
//     return db
//       .doc(`/geek/${snapshot.data().geekId}`)
//       .get()
//       .then(doc => {
//         if (
//           doc.exists &&
//           doc.data().userHandle !== snapshot.data().userHandle
//         ) {
//           return db.doc(`/notifications/${snapshot.id}`).set({
//             createdAt: new Date().toDateString(),
//             recipient: doc.data().userHandle,
//             sender: snapshot.data().userHandle,
//             type: 'like',
//             read: false,
//             geekId: doc.id
//           })
//         }
//       })
//       .catch(err => {
//         console.error(err)
//       })
//   })

// exports.deleteNotificationOnDisLike = functions.firestore
//   .document('/dislikes/{id}')
//   .onCreate(snapshot => {
//     return db
//       .doc(`/notifications/${snapshot.id}`)
//       .delete()
//       .catch(err => {
//         console.error(err)
//       })
//   })

// exports.createNotificationOnComment = functions.firestore
//   .document('/comments/{id}')
//   .onCreate(snapshot => {
//     return db
//       .doc(`/geek/${snapshot.data().geekId}`)
//       .get()
//       .then(doc => {
//         if (
//           doc.exists &&
//           doc.data().userHandle !== snapshot.data().userHandle
//         ) {
//           return db.doc(`/notifications/${snapshot.id}`).set({
//             createdAt: new Date().toDateString(),
//             recipient: doc.data().userHandle,
//             sender: snapshot.data().userHandle,
//             type: 'comment',
//             read: false,
//             geekId: doc.id
//           })
//         }
//       })
//       .catch(err => {
//         console.error(err)
//       })
//   })

// exports.onUserImageChange = functions.firestore
//   .document('/users/{userId}')
//   .onUpdate(change => {
//     console.log(change.before.data())
//     console.log(change.after.data())
//     if (change.before.data().imageUrl !== change.after.data().imageUrl) {
//       const batch = db.batch()
//       return db
//         .collection('geeks')
//         .where('userHandle', '==', change.before.data().handle)
//         .get()
//         .then(data => {
//           data.forEach(doc => {
//             const geek = db.doc(`/geek/${doc.id}`)
//             batch.update(geek, { userImage: change.after.data().imageUrl })
//           })
//           return batch.commit()
//         })
//     }
//   })
// onUserImageChange()
// exports.onGeekDelete = functions.firestore
//   .document('/geek/{geekId}')
//   .onDelete((snapshot, context) => {
//     const geekId = context.params.geekId
//     const batch = db.batch()

//     return db
//       .collection('comments')
//       .where('geekId', '=='.geekId)
//       .get()
//       .then(data => {
//         data.forEach(doc => {
//           // delete comments
//           batch.delete(db.doc(`/comments/${doc.id}`))
//         })
//         return db
//           .collection('likes')
//           .where('geekId', '==', geekId)
//           .get()
//       })
//       .then(data => {
//         data.forEach(doc => {
//           //  delete likes
//           batch.delete(db.doc(`/likes/${doc.id}`))
//         })
//         return db
//           .collection('dislikes')
//           .where('geekId', '==', geekId)
//           .get()
//       })
//       .then(data => {
//         data.forEach(doc => {
//           // delete dislikes
//           batch.delete(db.doc(`/dislikes/${doc.id}`))
//         })
//         return db
//           .collection('notifications')
//           .where('geekId', '==', geekId)
//           .get()
//       })
//       .then(data => {
//         data.forEach(doc => {
//           // delete notifications
//           batch.delete(db.doc(`/notifications/${doc.id}`))
//         })
//         return batch.commit()
//       })
//       .catch(err => console.error(err))
//   })

// exports.myFunction = functions.firestore
//   .document('my-collection/{docId}')
//   .onWrite((change, context) => {
//     /* ... */
//     // console.log('hey man')
//   })
