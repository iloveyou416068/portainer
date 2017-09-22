angular.module('auth', [])
.controller('AuthenticationController', ['$scope', 'languageSwitch','$state', '$stateParams', '$window', '$timeout', '$sanitize', 'Authentication', 'Users', 'UserService', 'EndpointService', 'StateManager', 'EndpointProvider', 'Notifications', 'SettingsService',
function ($scope, languageSwitch,$state, $stateParams, $window, $timeout, $sanitize, Authentication, Users, UserService, EndpointService, StateManager, EndpointProvider, Notifications, SettingsService) {

/*  $scope.login_title=languageSwitch.languageSwitch(100001);*/

  $scope.logo = StateManager.getState().application.logo;

  $scope.formValues = {
    Username: '',
    Password: ''
  };

  $scope.state = {
    AuthenticationError: ''
  };

  function setActiveEndpointAndRedirectToDashboard(endpoint) {
    var endpointID = EndpointProvider.endpointID();
    if (!endpointID) {
      EndpointProvider.setEndpointID(endpoint.Id);
    }
    StateManager.updateEndpointState(true)
    .then(function success(data) {
      $state.go('dashboard');
    })
    .catch(function error(err) {
      // Notifications.error('Failure', err, 'Unable to connect to the Docker endpoint');
      Notifications.error('Failure', err, '无法连接到Docker endpoint');

    });
  }

  function unauthenticatedFlow() {
    EndpointService.endpoints()
    .then(function success(data) {
      var endpoints = data;
      if (endpoints.length > 0)  {
        setActiveEndpointAndRedirectToDashboard(endpoints[0]);
      } else {
        $state.go('init.endpoint');
      }
    })
    .catch(function error(err) {
      // Notifications.error('Failure', err, 'Unable to retrieve endpoints');
      Notifications.error('Failure', err, '无法检索endpoints');
    });
  }

  function authenticatedFlow() {
    UserService.administratorExists()
    .then(function success(exists) {
      if (!exists) {
        $state.go('init.admin');
      }
    })
    .catch(function error(err) {
      // Notifications.error('Failure', err, 'Unable to verify administrator account existence');
      Notifications.error('Failure', err, '无法验证管理员帐户是否存在');
    });
  }

  $scope.authenticateUser = function() {
    var username = $scope.formValues.Username;
    var password = $scope.formValues.Password;

    SettingsService.publicSettings()
    .then(function success(data) {
      var settings = data;
      if (settings.AuthenticationMethod === 1) {
        username = $sanitize(username);
        password = $sanitize(password);
      }
      return Authentication.login(username, password);
    })
    .then(function success() {
      return EndpointService.endpoints();
    })
    .then(function success(data) {
      var endpoints = data;
      var userDetails = Authentication.getUserDetails();
      if (endpoints.length > 0)  {
        setActiveEndpointAndRedirectToDashboard(endpoints[0]);
      } else if (endpoints.length === 0 && userDetails.role === 1) {
        $state.go('init.endpoint');
      } else if (endpoints.length === 0 && userDetails.role === 2) {
        Authentication.logout();
        // $scope.state.AuthenticationError = 'User not allowed. Please contact your administrator.';
        $scope.state.AuthenticationError = '不允许用户。请联系您的系统管理员.';
      }
    })
    .catch(function error() {
      // $scope.state.AuthenticationError = 'Invalid credentials';
        $scope.state.AuthenticationError = '认证失败';
    });
  };

  function initView() {
    if ($stateParams.logout || $stateParams.error) {
      Authentication.logout();
      $scope.state.AuthenticationError = $stateParams.error;
      return;
    }

    if (Authentication.isAuthenticated()) {
      $state.go('dashboard');
    }

    var authenticationEnabled = $scope.applicationState.application.authentication;
    if (!authenticationEnabled) {
      unauthenticatedFlow();
    } else {
      authenticatedFlow();
    }
  }

  initView();
}]);
