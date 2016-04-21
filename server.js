var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var path = require('path')
var morgan = require('morgan')

if (process.env.DEPLOYED !== true) {
  console.log('Not On Heroku -> Using ENV File Instead')
  var dotenv = require('dotenv')
  dotenv.config()
}

var app = express()

app.use(cors())

// routes
var index = require('./index')
var signup = require('./signup')
var dashboard = require('./dashboard')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/public')))
app.use(morgan('dev'))

app.use('/index', index)
app.use('/signup', signup)
app.use('/dashboard', dashboard)

var port = process.env.PORT || 8080

app.listen(port, console.log('Magic happens on 8080'))
