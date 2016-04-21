var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var path = require('path')
var morgan = require('morgan')

var app = express()

if (!process.env.DEPLOYED) {
  var dotenv = require('dotenv')
  dotenv.config()
}

app.use(cors())

// routes
var index = require('./index')
var signup = require('./signup')
var dashboard = require('./dashboard')
var friends = require('./friends')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/public')))
app.use(morgan('dev'))

app.use('/index', index)
app.use('/signup', signup)
app.use('/dashboard', dashboard)
app.use('/friends', friends)

var port = process.env.PORT || 8080

app.listen(port, console.log('Magic happens on', port))
