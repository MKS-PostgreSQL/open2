var express = require('express')
var router = express.Router()
var db = require('./db.js')
var sendData = require('./helpers.js').sendData
var postData = require('./helpers.js').postData
var findUserId = require('./helpers.js').findUserId
var sendError = require('./helpers.js').sendError

// send a friend request to a user or accept a friend request
router.post('/request', function (req, res) {
  var username = req.headers.username
  var friend = req.body.friend
  var usernameId
  var friendId
  var select = 'SELECT Friends.id FROM Friends WHERE Friends.user_id = ? AND Friends.friend_id = ?;'
  var insert = 'INSERT INTO Friends SET `user_id` = ?, `friend_id` = ?;'
  findUserId(username).then(function (id) {
    usernameId = id
  }).then(function () {
    findUserId(friend).then(function (id) {
      friendId = id
    }).then(function () {
      // check if there is a pending request
      db.query(select, [usernameId, friendId], function (err, rows) {
        if (err) {
          console.error(err)
        } else {
          if (!rows.length) {
            // Send a friend request or accept a friend request
            db.query(insert, [usernameId, friendId], postData(res))
          } else {
            res.status(500).json({success: false})
          }
        }
      })
    })
  })
})

// retrieve a list of all usernames for search function
router.get('/users', function (req, res) {
  var username = req.headers.username
  var select = 'SELECT Users.username, Users.name, Users.online FROM Users ' +
  'WHERE Users.username != ?;'
  db.query(select, [username], sendData(res, 404))
})

// retreive all friends of a user
router.get('/all', function (req, res) {
  var username = req.headers.username
  var usernameId
  findUserId(username).then(function (id) {
    usernameId = id
  }).then(function () {
    var select = 'SELECT u.username, u.name, u.online FROM Users u ' +
    'INNER JOIN Friends f1 ' +
    'ON f1.user_id = u.id ' +
    'INNER JOIN Friends f2 ' +
    'ON f2.user_id = f1.friend_id AND f2.friend_id = f1.user_id ' +
    'WHERE f2.user_id =?;'
    db.query(select, [usernameId], sendData(res))
  })
})

// delete a friend
router.post('/delete', function (req, res) {
  var username = req.headers.username
  var friend = req.body.friend
  var usernameId
  var friendId
  var deleteFriend = 'DELETE FROM Friends WHERE Friends.user_id = ? AND Friends.friend_id = ?;'
  findUserId(username).then(function (id) {
    usernameId = id
  }).then(function () {
    findUserId(friend).then(function (id) {
      friendId = id
    }).then(function () {
      db.query(deleteFriend, [usernameId, friendId], function (err, rows) {
        if (err) {
          console.error(err)
          sendError(res, 500)
        } else {
          db.query(deleteFriend, [friendId, usernameId], postData(res))
        }
      })
    })
  })
})

module.exports = router
