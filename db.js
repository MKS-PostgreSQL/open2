var mysql = require('mysql')
var fs = require('fs')
var path = require('path')

if (!process.env.DEPLOYED) {
  var dotenv = require('dotenv')
  dotenv.config()
}

var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DB,
  multipleStatements: true
})

db.connect(function (err) {
  if (!err) {
    console.log('Database is connected')
  } else {
    console.log(err)
    console.log('Error connecting to database')
  }
})

db.on('error', function () {
  console.log('ERROR in database')
})

// Initial DB Setup when Server starts
fs.readFile(path.join(__dirname, '/schema.sql'), 'utf-8', function (err, data) {
  var commands = data.split(';')
  commands.pop()
  commands.forEach(function (command) {
    db.query(command, function (err, results) {
      if (err) {
        console.error(err)
      }
    })
  })
  if (err) {
    console.log(err)
  }
})

setInterval(function () { db.query('SELECT 1') }, 5000)

module.exports = db
