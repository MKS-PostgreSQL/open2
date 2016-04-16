
var app = angular.module('myApp', ['ngMaterial', 'ngRoute', 'ngMessages']);
  app.config(function($mdThemingProvider) {
    $mdThemingProvider.definePalette('Open2', {
  '50': '#ffffff',
  '100': '#ffdebd',
  '200': '#ffc285',
  '300': '#ff9e3d',
  '400': '#ff8f1f',
  '500': '#ff8000',
  '600': '#e07100',
  '700': '#c26100',
  '800': '#a35200',
  '900': '#854300',
  'A100': '#ffffff',
  'A200': '#ffdebd',
  'A400': '#ff8f1f',
  'A700': '#c26100',
  'contrastDefaultColor': 'light',
  'contrastDarkColors': '50 100 200 300 400 500 600 A100 A200 A400'
});
  });
    //route config
  app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
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
  });

    /// login controller
  app.controller('loginCtrl', function($scope, Services, $location) {
    $scope.redirectSignup = function() {
        $location.path('/signup');
      };
    $scope.submit = function() {
      var user = {
        username: $scope.username,
        password: $scope.password
      };
      console.log('scope username', $scope.username);
      console.log('services username', Services.username);
      Services.username = $scope.username;
      console.log("services username after login",Services.username);
    Services.login(user);
    };
  });

  app.controller('signupCtrl', function($scope, Services) {
      $scope.submit = function() {
        var user = {
          username: $scope.username,
          password: $scope.password
        };
      Services.signup(user);
      };

  });
    // dashboard controller
app.controller('dashboardCtrl', function($scope, Services,$mdDialog, $mdMedia, $route) {
  $scope.events = {};
  Services.uploadDashboard()
  .then(function(data){
   
    $scope.events.fetch = true;
    $scope.events.list = data;
  });

  //this is our pop up dialog box

  $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

  $scope.showAdvanced = function(ev) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'inviteForm.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen
    })

    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true);
    });
  };
  //this the end of our pop up dialog box.

  $scope.time = {
       value: new Date(2016, 3, 9)
     };
    //end of our time selector

 $scope.click = function() {
    var eventInfo = {
      'event' : $scope.user.activity,
      'time' : $scope.time.value,
      'username': Services.username
    }
     console.log("time", eventInfo);
   
 
    Services.eventsPost(eventInfo)
    .then(function(respData){
       console.log('i got this back from server/database', respData);
    })
    $route.reload();
  };
   
 $scope.status = 'join';
 $scope.join = function() {
  if($scope.status === 'join') {
    $scope.status = 'unjoin';
  }
  else {
    $scope.status = 'join';
  }
};

});

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});



app.factory('Services', function($http, $location) {
  var username;

  var login = function(user) {
    console.log('services username inside signup', username);
    return $http({
      method: 'POST',
      url: 'http://localhost:8080',
      data: user
    })
    .then(function(resp){
      $location.path('/dashboard');
    })
    .catch(function(err){
      $location.path('/');
      console.log(err);
    })
  };

  var logout = function(){
    $location.path('/');
  };

    var signup = function(user) {
    return $http({
      method: 'POST',
      url: 'http://localhost:8080/signup',
      data: user
    })
    .then(function(resp){
      $location.path('/login');
    })
    .catch(function(err){
      $location.path('/');
      console.log(err);
    })
  };

var uploadDashboard = function() {
  return $http({
    method: 'GET',
    url: 'http://localhost:8080/dashboard',
  })
  .then(function(resp){
   

    return resp.data;

  });
};
 //// Twillio notification
 var notify = function(sendText){
    return $http({
      method: 'POST',
      url: 'http://localhost:8080/dashboard',
      data: sendText
    })
    .then(function(data){
      console.log("Sent the Messages", data);
    })
    .catch(function(err){
      $location.path('/');
      console.log(err);
    })
  };

   var eventsPost = function(eventInfo) {
    console.log('eventinfo inside events post', eventInfo);

      return $http({
        method: 'POST',
        url: 'http://localhost:8080/dashboard',
        data: eventInfo

      })

   }

return {
  login: login,
  uploadDashboard: uploadDashboard,
  notify: notify,
  eventsPost: eventsPost,
  signup: signup,
  logout: logout,
  username: username
};

});


app.controller('AppCtrl', function ($scope, $timeout, Services, $mdSidenav, $log) {
   $scope.toggleLeft = buildDelayedToggler('left');
   $scope.toggleRight = buildToggler('right');
   $scope.logout = function(){
     Services.logout();
   }
   $scope.isOpenRight = function(){
     return $mdSidenav('right').isOpen();
   };
   /**
    * Supplies a function that will continue to operate until the
    * time is up.
    */
   function debounce(func, wait, context) {
     var timer;
     return function debounced() {
       var context = $scope,
           args = Array.prototype.slice.call(arguments);
       $timeout.cancel(timer);
       timer = $timeout(function() {
         timer = undefined;
         func.apply(context, args);
       }, wait || 10);
     };
   }
   /**
    * Build handler to open/close a SideNav; when animation finishes
    * report completion in console
    */
   function buildDelayedToggler(navID) {
     return debounce(function() {
       $mdSidenav(navID)
         .toggle()
         .then(function () {
           $log.debug("toggle " + navID + " is done");
         });
     }, 200);
   }
   function buildToggler(navID) {
     return function() {
       $mdSidenav(navID)
         .toggle()
         .then(function () {
           $log.debug("toggle " + navID + " is done");
         });
     }
   }
 })
 .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
   $scope.close = function () {
     $mdSidenav('left').close()
       .then(function () {
         $log.debug("close LEFT is done");
       });
   };
 })
 .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
   $scope.close = function () {
     $mdSidenav('right').close()
       .then(function () {
         $log.debug("close RIGHT is done");
       });
   };
 });

//NOTIFICATION BOX
app.config(function($mdThemingProvider) {
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
});
});


app.controller('SubheaderAppCtrl', function($scope) {
   $scope.messages = [
     {
       what: 'Brunch this weekend?',
       who: 'Dain',
       when: '3:08PM',
       notes: " I'll be in your neighborhood doing errands"
     },
   ];
});



function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}


