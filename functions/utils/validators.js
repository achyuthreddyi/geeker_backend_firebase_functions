const {
  exampleObjectMetadata
} = require('firebase-functions-test/lib/providers/storage')
const { user } = require('firebase-functions/lib/providers/auth')

const isEmpty = string => {
  if (string.trim() === '') return true
  else return false
}
const isEmail = email => {
  // const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  if (email.match(emailRegEx)) return true
  else return false
}

exports.validateSignUpData = data => {
  const errors = {}

  if (isEmpty(data.email)) {
    errors.email = 'Email must not be empty'
  } else if (!isEmail(data.email)) {
    errors.email = 'Must be a valid email address'
  }

  if (isEmpty(data.password)) errors.password = 'Must not be empty'
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords must match'
  }
  if (isEmpty(data.handle)) errors.password = 'Must not be empty'

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? 1 : 0
  }
}

exports.validateLoginData = data => {
  const errors = {}
  if (isEmpty(data.email)) {
    errors.email = 'Email must not be empty'
  } else if (!isEmail(data.email)) {
    errors.email = 'Must be a valid email address'
  }
  if (isEmpty(data.password)) errors.password = 'Must not be empty'
  // if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? 1 : 0
  }
}

exports.reduceUserDetails = data => {
  const userDetails = {}

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio
  if (!isEmpty(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website}`
    } else userDetails.website = data.website
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location

  return userDetails
}
