var app = angular.module('myApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'uiGmapgoogle-maps'])

app.controller('ChatController', function ($scope) {
  $scope.switchRooms = function (event) {
    window.localStorage.setItem('currentRoom', event.id)
    console.log(event);
    socket.emit('requestRoomChange', {roomID: event.id})
  }

  $scope.messages = []
  var socket = io.connect('/')

  socket.on('refresh', function (data) {
    $scope.messages = data.messages
    // console.log($scope.messages)
    $scope.$apply()
  })

  socket.on('newMessage', function (data) {
    $scope.messages.push(data)
    $scope.$apply()
  })

  $scope.sendMessage = function () {
    socket.emit('sendMessage', {
      author: window.localStorage.getItem('username'),
      text: $scope.newMessage,
      roomID: window.localStorage.getItem('currentRoom')
    })
    $scope.newMessage = ''
  }
})

app.config(function ($mdThemingProvider) {
  $mdThemingProvider.definePalette('Open2Pallete', {
    '50': 'FFBC4F',
    '100': 'FFBC4F',
    '200': 'FFBC4F',
    '300': 'FFBC4F',
    '400': 'FFBC4F',
    '500': 'FFBC4F', // this is our bar color
    '600': 'e53935', // mouse hover over NEW EVENT button color
    '700': '7CFC00',
    '800': '7CFC00',
    '900': '7CFC00',
    'A100': '7CFC00',
    'A200': '7CFC00',
    'A400': '7CFC00',
    'A700': '7CFC00'
  })
  $mdThemingProvider.theme('default')
    .primaryPalette('Open2Pallete')
})

// route config
app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'login.html',
      controller: 'loginCtrl'
    })
    .when('/dashboard', {
      templateUrl: 'dashboard.html'
    })
    .when('/signup', {
      templateUrl: 'signup.html'
    })
    .otherwise({
      redirectTo: '/'
    })
})

// / login controller
app.controller('loginCtrl', function ($scope, Services, $location) {
  $scope.redirectSignup = function () {
    $location.path('/signup')
  }

  $scope.submit = function () {
    window.navigator.geolocation.getCurrentPosition(function (data) {
      $scope.userlongitude = data.coords.longitude
      $scope.userlatitude = data.coords.latitude
      var user = {
        username: $scope.username,
        password: $scope.password,
        longitude: $scope.userlongitude,
        latitude: $scope.userlatitude
      }
      window.localStorage.setItem('username', $scope.username)
      Services.login(user)
    })
  }
})

// signup controller
app.controller('signupCtrl', function ($scope, Services) {
  $scope.submit = function () {
    var user = {
      username: $scope.username,
      password: $scope.password
    }
    Services.signup(user)
  }
})

// dashboard controller
app.controller('dashboardCtrl', function ($scope, Services, $mdDialog, $mdMedia, $route, $sce) {
  $scope.events = {}
  $scope.center = null
  $scope.switchRooms = function(room) {
    console.log(room)
  }
  window.navigator.geolocation.getCurrentPosition(function (data) {
    $scope.center = {
      latitude: data.coords.latitude,
      longitude: data.coords.longitude
    }
    $scope.$apply()
  })
  var user = window.localStorage.getItem('username')
  var username = {
    username: user
  }
  Services.getLocation(username).then(function (data) {
    var markers = function (locations) {
      var location = []
      for (var i = 0; i < locations.length; i++) {
        var newMarker = {
          id: parseInt(i),
          coords: {
            longitude: locations[i].longitude,
            latitude: locations[i].latitude
          },
          status: locations[i].status,
          title: locations[i].username
        }
        location.push(newMarker)
      }
      return location
    }
    $scope.markers = markers(data.data)
  })

  // // start uploading dashboard
  Services.uploadDashboard()
    .then(function (data) {
      $scope.events.fetch = true
      var myEvents = []
      var eventsToJoin = []

      // creating list of the events that current user attends or created himself
      data.forEach(function (item) {
        if (item.username === window.localStorage.getItem('username') && item.created_by === 0) {
          myEvents.push(
            {
              'eventname': item.eventname,
              'id': item.id,
              'timestamp': item.createdAt,
              'username': item.username,
              'createdBy': item.created_by,
              'status': 'unjoin'
            })
        } else if (item.username === window.localStorage.getItem('username') && item.created_by === 1) {
          myEvents.push({
            'eventname': item.eventname,
            'id': item.id,
            'timestamp': item.createdAt,
            'username': item.username,
            'createdBy': item.created_by,
            'status': 'created by me'

          })
        }
      })

      // creating the list of events that are created by the user's friends, but aren't joined by the user
      data.forEach(function (item) {
        if (item.username !== window.localStorage.getItem('username') && item.created_by === 1) {
          eventsToJoin.push({
            'eventname': item.eventname,
            'id': item.id,
            'timestamp': item.createdAt,
            'username': item.username,
            'createdBy': item.created_by,
            'status': 'join'
          })
        }
      })

      $scope.events.list = eventsToJoin
      $scope.events.eventsIgoTo = myEvents
    }) // end of .then

  // //////////////end of uploading dashboard

  // join or unjoin event

  $scope.join = function (id, status) {
    // join
    if (status === 'join') {
      var joinInfo = {
        'eventId': id,
        'user': window.localStorage.getItem('username')
      }
      Services.joinEvent(joinInfo)
      $route.reload()
    } else if (status === 'unjoin') {
      // delete the record about user's attendance from database
      Services.unjoinEvent(id) // this doesn't work for some reason.
    }
  }

  // 002
  Services.uploadFriendslist()
    .then(function (data) {
      var friendsArr = data.data.data
      $scope.friends = friendsArr
    })

  // this is our pop up dialog box

  $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm')
  $scope.showAdvanced = function (ev) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'inviteForm.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: useFullScreen
    })

    $scope.$watch(function () {
      return $mdMedia('xs') || $mdMedia('sm')
    }, function (wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true)
    })
  }
  // this the end of our pop up dialog box.

  $scope.time = {
    value: new Date(2016, 3, 9) // fix timestamp
  } // end of our time selector

  $scope.click = function () {
    var eventInfo = {
      'event': $scope.user.activity,
      'time': $scope.time.value, // fix timestamp
      'username': window.localStorage.getItem('username')
    }

    Services.eventsPost(eventInfo)
      .then(function (respData) {
        // console.log('I got this back from server/database', respData)
        $route.reload() //
      })
  }
}) // /////// end of dahboard controller

// / this reversed the order of the events displayed on dashboard
app.filter('reverse', function () {
  return function (items) {
    return items.slice().reverse()
  }
})

// / factory for get/post requests
app.factory('Services', function ($http, $location) {
  // login
  var login = function (user) {
    return $http({
      method: 'POST',
      url: '/index/homepage',
      data: user
    })
      .then(function (resp) {
        $location.path('/dashboard')
      })
      .catch(function (err) {
        $location.path('/')
        console.log(err)
      })
  }

  var getLocation = function (user) {
    return $http({
      method: 'POST',
      url: '/dashboard/location',
      data: user
    })
  }

  // logout

  var logout = function (username) {
    return $http({
      method: 'POST',
      url: '/dashboard/logout',
      data: username
    })
      .then(function (resp) {
        $location.path('/')
      })
  }

  // signup

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/signup/newuser',
      data: user
    })
      .then(function (resp) {
        $location.path('/login')
      })
      .catch(function (err) {
        $location.path('/')
        console.error(err)
      })
  }

  // get the event info from database
  var uploadDashboard = function () {
    return $http({
      method: 'GET',
      url: '/dashboard/upload'
    })
      .then(function (resp) {
        // console.log("data in uploadDashboard", resp.data)
        return resp.data
      })
  }

  // // Twillio notification
  var notify = function (sendText) {
    return $http({
      method: 'POST',
      url: '/dashboard',
      data: sendText
    })
      .then(function (data) {
        console.log('Sent the Messages', data)
      })
      .catch(function (err) {
        $location.path('/')
        console.log(err)
      })
  }

  // new event request
  var eventsPost = function (eventInfo) {
    // console.log('eventinfo inside events post', eventInfo)
    return $http({
      method: 'POST',
      url: '/dashboard/events',
      data: eventInfo
    })
  }
  // 001
  // get freinds list --> needs to be fixed
  var uploadFriendslist = function () {
    var config = {
      headers: {
        username: window.localStorage.getItem('username')
      }
    }

    return $http.get('/friends/all', config)
  }

  // add a record to database when user joins an event
  var joinEvent = function (blob) {
    return $http({
      method: 'POST',
      url: '/dashboard/join',
      data: {eventId: blob.eventId, username: blob.user}
    })
  }

  // remove the record of user from database// this isn't handled in the backend
  var unjoinEvent = function (userEventId) {
    return $http({
      method: 'POST',
      url: '/dashboard/unjoin',
      data: userEventId
    })
  }

  return {
    login: login,
    getLocation: getLocation,
    uploadDashboard: uploadDashboard,
    notify: notify,
    eventsPost: eventsPost,
    signup: signup,
    logout: logout,
    uploadFriendslist: uploadFriendslist,
    joinEvent: joinEvent,
    unjoinEvent: unjoinEvent
  }
})
// / end of Services

// /// controller handles styling

app.controller('AppCtrl', function ($scope, $timeout, Services, $mdSidenav, $log) {
  $scope.toggleLeft = buildDelayedToggler('left')
  $scope.toggleRight = buildToggler('right')
  $scope.logout = function () {
    var user = window.localStorage.getItem('username')
    var username = {
      username: user
    }
    Services.logout(username)
  }
  $scope.isOpenRight = function () {
    return $mdSidenav('right').isOpen()
  }
  /**
  * Supplies a function that will continue to operate until the
  * time is up.
  */
  function debounce (func, wait, context) {
    var timer
    return function debounced () {
      var context = $scope
      var args = Array.prototype.slice.call(arguments)
      $timeout.cancel(timer)
      timer = $timeout(function () {
        timer = undefined
        func.apply(context, args)
      }, wait || 10)
    }
  }
  /**
  * Build handler to open/close a SideNav when animation finishes
  * report completion in console
  */
  function buildDelayedToggler (navID) {
    return debounce(function () {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug('toggle ' + navID + ' is done')
        })
    }, 200)
  }
  function buildToggler (navID) {
    return function () {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug('toggle ' + navID + ' is done')
        })
    }
  }
})
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug('close LEFT is done')
        })
    }
  })
  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.debug('close RIGHT is done')
        })
    }
  })

// NOTIFICATION BOX
app.config(function ($mdThemingProvider) {
  $mdThemingProvider.definePalette('ojo', {
    '50': '#fffefe',
    '100': '#ffcfb2',
    '200': '#ffac7a',
    '300': '#ff7f32',
    '400': '#ff6c14',
    '500': '#f45c00',
    '600': '#d55000',
    '700': '#b74500',
    '800': '#983900',
    '900': '#7a2e00',
    'A100': '#fffefe',
    'A200': '#ffcfb2',
    'A400': '#ff6c14',
    'A700': '#b74500',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 A100 A200 A400'
  })
})

app.controller('SubheaderAppCtrl', function ($scope) {
  $scope.messages = [
    {
      what: 'Brunch this weekend?',
      who: 'Dain',
      when: '3:08PM',
      notes: " I'll be in your neighborhood doing errands"
    }
  ]
})

function DialogController ($scope, $mdDialog) {
  $scope.hide = function () {
    $mdDialog.hide()
  }
  $scope.cancel = function () {
    $mdDialog.cancel()
  }
  $scope.answer = function (answer) {
    $mdDialog.hide(answer)
  }
}
