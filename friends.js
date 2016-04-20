var express = require('express')
var router = express.Router()
var db = require('../../db.js')
var sendError = require('../helpers.js').sendError
var sendSuccess = require('../helpers.js').sendSuccess
var sendData = require('../helpers.js').sendData
var postData = require('../helpers.js').postData
var findUserId = require('../helpers.js').findUserId

//send a friend request to a user or accept a friend request
router.post('/request', function (req, res) {
  var username = req.headers.username
  var friend = req.body.friend
  var usernameId
  var friendId
  findUserId(username).then(function (id) {
    usernameId = id
  }).then(function () {
    findUserId(friend).then(function (id) {
      friendId = id
    }).then(function () {
      var insert = 'INSERT INTO Friends SET `user_id` = ?, `friend_id` = ?;'
      db.query(insert, [usernameId, friendId], postData(res))
    })
  })
})

//retrieve a list of all usernames for search function
router.get('/friends/users', function (req, res) {
  var username = req.headers.username
  var select = 'SELECT Users.username, Users.online FROM Users ' +
  'WHERE Users.username != ?;'
  db.query(select, [username], sendData(res, 404))
})
module.exports = router