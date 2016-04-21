var express = require('express')
var db = require('./db.js')
var bcrypt = require('bcrypt')
var cors = require('cors')
var bodyParser = require('body-parser')

var router = express.Router()

var app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// adds a new user to database
router.post('/newuser', function (request, response) {
  var username = request.body.username
  var password = request.body.password
  var long = request.body.longitude
  var lat = request.body.latitude
  var hashedPass = bcrypt.hashSync(password, 10)

  var users = {username: username, password: hashedPass, longitude: long, latitude: lat}

  db.query('INSERT INTO Users SET ?', users, function (err, results) {
    if (err) {
      response.sendStatus(500)
    } else {
      response.send('/')
    }
  })
})

module.exports = router
