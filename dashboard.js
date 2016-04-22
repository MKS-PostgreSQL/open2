var router = require('express').Router()
var db = require('./db.js')
var twilio = require('twilio')('AC40691c0816f7dd360b043b23331f4f43', '89f0d01b69bb6bcc473724b5b232b6f4')

router.post('/location', function (request, response) {
  var username = request.body.username
  var friends = 'SELECT u.longitude, u.latitude FROM Users u ' +
    'INNER JOIN Friends f1 ' +
    'ON f1.user_id = u.id ' +
    'INNER JOIN Friends f2 ' +
    'ON f2.user_id = f1.friend_id AND f2.friend_id = f1.user_id ' +
    'WHERE f2.user_id =?;'
  db.query('SELECT `id` FROM Users WHERE `username` = ?;',
    [username], function (err, row) {
      if (err) {
        console.error(err)
      } else {
        db.query(friends, [row[0].id],
          function (err, rows) {
            if (err) {
              console.error(err)
            } else {
              response.send(rows)
            }
          })
      }
    })
})

router.post('/events', function (request, response) {
  var event = request.body.event
  var timestamp = request.body.time
  var username = request.body.username

  var events = {eventname: event, createdAt: timestamp}

  // this will send a text message to the "to" user
  // get twilio trial account to get a phone number which sends texts from "from"
  twilio.sendMessage({
    to: '+1************',
    from: '+1**********',
    body: 'I am available to ' + event + ' at ' + timestamp
  })

  db.query('INSERT INTO Events SET ?', events, function (err, results) {
    if (err) {
      response.sendStatus(500)
    } else {
      var eventId = results.insertId

      db.query('SELECT * FROM Events WHERE `id` = ?;', [eventId], function (err, rows) {
        if (err) {
          throw err
        } else {
          response.send(rows)

          db.query('SELECT * FROM Users WHERE `username` = ?;', [username], function (err, rows) {
            if (err) {
              throw err
            } else {
              var userId = rows[0].id

              addUserEvents(userId, eventId, 1)
            }
          })
        }
      })
    }
  })
})

var addUserEvents = function (creator, eventId, status) {
  var userEvents = {user_id: creator, event_id: eventId, created_by: status}
  db.query('INSERT INTO Attendance SET ?', userEvents, function (err, results) {
    if (err) {
      console.log(err)
    } else {
      console.log('Add User Events')
    }
  })
}

router.get('/upload', function (request, response) {
  db.query('SELECT Users.username, Events.eventname, Events.createdAt, Attendance.id, Attendance.created_by FROM Users INNER JOIN Attendance ON Users.id = Attendance.user_id INNER JOIN Events ON Events.id = Attendance.event_id ORDER BY event_id', function (err, rows) {
    if (err) {
      throw err
    } else {
      response.send(rows)
    }
  })
})

// Not actually getting user's friends
router.get('/friends', function (request, response) {
  db.query('SELECT username FROM Users', function (err, results) {
    if (err) {
      throw err
    } else {
      response.send(results)
    }
  })
})

router.post('/join', function (request, response) {
  var username = request.body.username
  var id = request.body.eventId

  db.query('SELECT id FROM Users WHERE `username` = ?;', [username], function (err, rows) {
    if (err) {
      throw err
    } else {
      var userId = rows[0].id

      db.query('SELECT event_id FROM Attendance WHERE `id` = ?;', [id], function (err, rows) {
        if (err) {
          throw err
        } else {
          var eventId = rows[0].event_id
          addUserEvents(userId, eventId, 0)
        }
      })
    }
  })
})

router.post('/logout', function (request, response) {
  var username = request.body.username
  db.query('UPDATE Users SET Users.online = NOT Users.online WHERE Users.username = ?;',
    [username], function (err, rows) {
      if (err) {
        console.error(err)
      } else {
        response.sendStatus(201)
      }
    })
})

module.exports = router
