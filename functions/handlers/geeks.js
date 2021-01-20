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
    createdAt: new Date().toISOString()
  }

  db.collection('geek')
    .add(newGeek)
    .then(doc => {
      res.json({ message: `document ${doc.id} created succcessfully!!` })
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong' })
      console.log(err)
    })
}
