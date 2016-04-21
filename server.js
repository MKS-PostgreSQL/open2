var bodyParser = require('body-parser')
var cors = require('cors')
var dotenv = require('dotenv')
var path = require('path')
var morgan = require('morgan')
var express = require('express')
var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
dotenv.config()

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

var db = 'not yet initialized'
http.listen(port, function() {
  console.log('Magic happens on 8080')
  db = require('./db.js')
})

io.on('connection', function(socket) {
  var messages = []

  db.query('SELECT message FROM Messages', function (err, rows) {
    if (err) {
      console.log(err)
    } else {
      rows.forEach(function (value) {
        messages.push(value.message)
      })
    }
    socket.emit('refresh', {messages: messages})
  })

  socket.on('sendMessage', function (data) {
    messages.push(data.message)
    db.query('INSERT INTO Messages (event_id, author_id, message) VALUES (1, 1, ?)', data.message, function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        socket.emit('newMessage', {message: data.message})
      }
    })
  })
})
