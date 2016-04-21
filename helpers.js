var db = require('./db.js')
var dt = {}

// find user id of a user
dt.findUserId = function (username) {
  var userId
  var query = 'SELECT `id` FROM Users WHERE `username` = ?;'
  return new Promise(function (resolve) {
    db.query(query, [username], function (err, rows) {
      if (err) {
        console.error(err)
      } else {
        userId = rows[0].id
        resolve(userId)
      }
    })
  })
}

// success callback for POST or GET methods
dt.sendSuccess = function (res, method, rows) {
  if (method === 'post') {
    res.status(201).json({success: true})
  } else if (method === 'get') {
    res.json({success: true, data: rows})
  } else {
    console.error('HTTP METHOD NOT PROVIDED!')
  }
}

var sendSuccess = dt.sendSuccess

// send error for POST or GET methods
dt.sendError = function (res, code, err) {
  console.error(err)
  res.status(code).json({success: false})
}

var sendError = dt.sendError

// callback to retrieve data for GET requests
dt.sendData = function (res) {
  return function (err, rows) {
    if (err) {
      sendError(res, 404, err)
    } else {
      sendSuccess(res, 'get', rows)
    }
  }
}

// callback for POST request
dt.postData = function (res) {
  return function (err, rows) {
    if (err) {
      sendError(res, 500, err)
    } else {
      sendSuccess(res, 'post')
    }
  }
}

module.exports = dt
