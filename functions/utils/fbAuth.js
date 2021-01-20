const { admin } = require('./admin')
const { db } = require('../utils/admin')

module.exports = (req, res, next) => {
  let idToken
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split(' ')[1]
  } else {
    console.error('no token found')
    return res.status(403).json({ error: 'UnAuthorized' })
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken
      console.log('decoded Token', decodedToken)
      console.log(
        'getting data from the database',
        db.collection('users').where('userId', '==', req.user.uid)
      )
      return db
        .collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get()
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle
      return next()
    })
    .catch(err => {
      console.error('error loading the token', err)
      return res.status(403).json(err)
    })
}
