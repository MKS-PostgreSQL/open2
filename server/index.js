var express = require('express')
var db = require('./db.js')
var cors = require('cors')
var router = express.Router()
var bcrypt = require('bcrypt-nodejs')

var app = express()
app.use(cors())

// checks username and password
router.post('/homepage', function (request, response) {
  var username = request.body.username
  var password = request.body.password

  db.query('SELECT * FROM Users WHERE `username` = ?;', [username], function (err, rows) {
    console.log('This is our password in our db', rows[0].password)

    console.log('This is the bcrypt pass true/false', bcrypt.compareSync(password, rows[0].password))

    if (err) {
      throw err
    } else {
      if (!bcrypt.compareSync(password, rows[0].password)) {
        console.log('Incorrect password')
      } else {
        response.send('/dashboard')
      }
    }
  })
})

module.exports = router
