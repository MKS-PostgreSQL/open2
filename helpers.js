var db = require('../db.js')
var dt = {}

//find user id of a user
dt.findUserId = findUser = function (username) {
  var userId
  var query = 'SELECT `id` FROM Users WHERE `username` = ?;'
  return new Promise (function (resolve) {
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

//success callback for POST or GET methods
dt.sendSuccess = sendSuccess = function (res, method, rows) {
  console.log('sendSuccess --- ROWS: ', rows)
  if (method === 'post') {
    console.log('sendSuccess --- POST')
    res.status(201).json({success: true})
  } else if (method === 'get') {
    console.log('sendSuccess --- GET')
    res.json({success: true, data: rows})
  } else {
    console.error('HTTP METHOD NOT PROVIDED!')
  }
}

//send error for POST or GET methods
dt.sendError = sendError = function (res, code, err) {
  console.error(err)
  res.status(code).json({success: false})
}

//callback to retrieve data for GET requests
dt.sendData = sendData = function (res) {
  return function (err, rows) {
    if (err) {
      sendError(res, 404, err)
    } else {
      sendSuccess(res, 'get', rows)
    }
  }
}

//callback for POST request
dt.postData = postData = function (res) {
  return function (err, rows) {
    if (err) {
      sendError(res, 500, err)
    } else {
      sendSuccess(res, 'post')
    }
  }
}

module.exports = dt