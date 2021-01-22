// const { error } = require('firebase-functions/lib/logger')
const { db } = require('../utils/admin')

exports.getAllGeeks = (req, res) => {
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
      return res.json(geeks)
    })
    .catch(err => {
      console.error('error while verifying the token', err)
      return res.status(403).json(err)
    })
}

exports.createOneGeek = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'body should not be empty' })
  }
  const newGeek = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
    userImage: req.user.imageUrl,
    likeCount: 0,
    commentCount: 0,
    dislikeCount: 0
  }

  db.collection('geek')
    .add(newGeek)
    .then(doc => {
      const resGeek = newGeek
      resGeek.geekId = doc.id
      res.json({
        message: `document ${doc.id} created succcessfully!!`,
        newGeek: resGeek
      })
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong' })
      console.log(err)
    })
}

exports.getGeekById = (req, res) => {
  let geekData = {}
  db.doc(`/geek/${req.params.geekId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'geek not found' })
      } else {
        geekData = doc.data()
        geekData.geekId = doc.id
        return db
          .collection('comments')
          .orderBy('createdAt', 'desc')
          .where('geekId', '==', req.params.geekId)
          .get()
      }
    })
    .then(data => {
      geekData.comments = []
      data.forEach(doc => {
        geekData.comments.push(doc.data())
      })
      return res.status(200).json(geekData)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err })
    })
}

exports.deleteGeekById = (req, res) => {
  const document = db.doc(`/geek/${req.params.geekId}`)

  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'geek not found' })
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res
          .status(403)
          .json({ error: 'Unauthorized to perform the delete' })
      } else {
        return document.delete()
      }
    })
    .then(() => {
      res.status(200).json({ message: 'geek deleted successfully' })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err })
    })
}

exports.commentOnGeek = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(404).json({ error: 'comment should not be empty' })
  }
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    geekId: req.params.geekId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  }
  // FIXME: get the latest image of the user or create a new query to the database

  db.doc(`/geek/${req.params.geekId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(400).json({ error: 'this geek does not exist' })
      } else {
        return db.collection('comments').add(newComment)
      }
    })
    .then(doc => {
      res.json({ message: `comment with ${doc.id} created successfully` })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: 'something went wrong' })
    })
}

exports.likeGeekById = (req, res) => {
  const alreadyLikeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('geekId', '==', req.params.geekId)
    .limit(1)

  const geekDoc = db.doc(`/geek/${req.params.geekId}`)

  let geekData = {}

  geekDoc
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'geek not found' })
      } else {
        geekData = doc.data()
        geekData.geekId = doc.id
        return alreadyLikeDocument.get()
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection('likes')
          .add({
            geekId: req.params.geekId,
            userHandle: req.user.handle,
            createdAt: new Date().toISOString()
          })
          .then(() => {
            geekData.likeCount++
            return geekDoc.update({ likeCount: geekData.likeCount })
          })
          .then(() => {
            return res.json(geekData)
          })
      } else {
        return res.status(400).json({ error: 'geek already liked' })
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.code })
    })
}

exports.disLikeGeekById = (req, res) => {
  const alreadyDisLikedDocument = db
    .collection('dislikes')
    .where('userHandle', '==', req.user.handle)
    .where('geekId', '==', req.params.geekId)
    .limit(1)

  const geekDoc = db.doc(`/geek/${req.params.geekId}`)

  let geekData = {}

  geekDoc
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'geek not found' })
      } else {
        geekData = doc.data()
        geekData.geekId = doc.id
        return alreadyDisLikedDocument.get()
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection('dislikes')
          .add({
            geekId: req.params.geekId,
            userHandle: req.user.handle,
            createdAt: new Date().toISOString()
          })
          .then(() => {
            geekData.dislikeCount++
            return geekDoc.update({ dislikeCount: geekData.dislikeCount })
          })
          .then(() => {
            return res.json(geekData)
          })
      } else {
        return res
          .status(400)
          .json({ error: 'geek already disliked by you so much hatred ????' })
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500)
    })
}
