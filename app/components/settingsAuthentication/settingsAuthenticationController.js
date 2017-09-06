angular.module('settingsAuthentication', [])
.controller('SettingsAuthenticationController', ['$q', '$scope', 'Notifications', 'SettingsService', 'FileUploadService',
function ($q, $scope, Notifications, SettingsService, FileUploadService) {

  $scope.state = {
    successfulConnectivityCheck: false,
    failedConnectivityCheck: false,
    uploadInProgress: false
  };

  $scope.formValues = {
    TLSCACert: ''
  };

  $scope.addSearchConfiguration = function() {
    $scope.LDAPSettings.SearchSettings.push({ BaseDN: '', UserNameAttribute: '', Filter: '' });
  };

  $scope.removeSearchConfiguration = function(index) {
    $scope.LDAPSettings.SearchSettings.splice(index, 1);
  };

  $scope.LDAPConnectivityCheck = function() {
    $('#connectivityCheckSpinner').show();
    var settings = $scope.settings;
    var TLSCAFile = $scope.formValues.TLSCACert !== settings.LDAPSettings.TLSConfig.TLSCACert ? $scope.formValues.TLSCACert : null;

    var uploadRequired = ($scope.LDAPSettings.TLSConfig.TLS || $scope.LDAPSettings.StartTLS) && !$scope.LDAPSettings.TLSConfig.TLSSkipVerify;
    $scope.state.uploadInProgress = uploadRequired;

    $q.when(!uploadRequired || FileUploadService.uploadLDAPTLSFiles(TLSCAFile, null, null))
    .then(function success(data) {
      return SettingsService.checkLDAPConnectivity(settings);
    })
    .then(function success(data) {
      $scope.state.failedConnectivityCheck = false;
      $scope.state.successfulConnectivityCheck = true;
      Notifications.success('Connection to LDAP successful');
    })
    .catch(function error(err) {
      $scope.state.failedConnectivityCheck = true;
      $scope.state.successfulConnectivityCheck = false;
      Notifications.error('Failure', err, 'Connection to LDAP failed');
    })
    .finally(function final() {
      $scope.state.uploadInProgress = false;
      $('#connectivityCheckSpinner').hide();
    });
  };

  $scope.saveSettings = function() {
    $('#updateSettingsSpinner').show();
    var settings = $scope.settings;
    var TLSCAFile = $scope.formValues.TLSCACert !== settings.LDAPSettings.TLSConfig.TLSCACert ? $scope.formValues.TLSCACert : null;

    var uploadRequired = ($scope.LDAPSettings.TLSConfig.TLS || $scope.LDAPSettings.StartTLS) && !$scope.LDAPSettings.TLSConfig.TLSSkipVerify;
    $scope.state.uploadInProgress = uploadRequired;

    $q.when(!uploadRequired || FileUploadService.uploadLDAPTLSFiles(TLSCAFile, null, null))
    .then(function success(data) {
      return SettingsService.update(settings);
    })
    .then(function success(data) {
      Notifications.success('Authentication settings updated');
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to update authentication settings');
    })
    .finally(function final() {
      $scope.state.uploadInProgress = false;
      $('#updateSettingsSpinner').hide();
    });
  };

  function initView() {
    $('#loadingViewSpinner').show();
    SettingsService.settings()
    .then(function success(data) {
      var settings = data;
      $scope.settings = settings;
      $scope.LDAPSettings = settings.LDAPSettings;
      $scope.formValues.TLSCACert = settings.LDAPSettings.TLSConfig.TLSCACert;
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to retrieve application settings');
    })
    .finally(function final() {
      $('#loadingViewSpinner').hide();
    });
  }

  initView();
}]);
