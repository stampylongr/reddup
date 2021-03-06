(function () {
  'use strict';

  function rpMessageSidenavCtrl(
    $scope,
    $rootScope,
    $mdDialog,
    rpSettingsService,
    rpAppLocationService,
    rpIdentityService,
    rpAppIsMobileViewService
  ) {
    var deregisterMessagesRead;
    $scope.isMessageOpen = false;

    $scope.toggleMessageOpen = function () {
      $scope.isMessageOpen = !$scope.isMessageOpen;
    };

    $scope.hasMail = false;

    rpIdentityService.getIdentity(function (data) {
      $scope.hasMail = angular.isDefined((data || {})
        .has_mail) ? data.has_mail : false;
    });

    $scope.showCompose = function (e) {
      console.log('[rpMessageSidenavCtrl] $scope.animations: ' + $scope.animations);

      if ((rpSettingsService.getSetting('composeDialog') && !e.ctrlKey) || rpAppIsMobileViewService.isMobileView()) {
        $mdDialog.show({
          controller: 'rpMessageComposeDialogCtrl',
          templateUrl: 'rpMessage/rpMessageCompose/views/rpMessageComposeDialog.html',
          targetEvent: e,
          clickOutsideToClose: false,
          escapeToClose: false,
          locals: {
            shareLink: null,
            shareTitle: null
          }

        });
      } else {
        rpAppLocationService(e, '/message/compose', '', true, false);
      }
    };

    $scope.showInbox = function (e) {
      rpAppLocationService(e, '/message/inbox', '', true, false);
    };

    $scope.showSent = function (e) {
      rpAppLocationService(e, '/message/sent', '', true, false);
    };

    deregisterMessagesRead = $rootScope.$on('rp_messages_read', function () {
      console.log('[rpMessageSidenavCtrl] rp_messages_read');
      $scope.hasMail = false;
    });

    $scope.$on('$destroy', function () {
      deregisterMessagesRead();
    });
  }

  angular.module('rpMessage')
    .controller('rpMessageSidenavCtrl', ['$scope',
      '$rootScope',
      '$mdDialog',
      'rpSettingsService',
      'rpAppLocationService',
      'rpIdentityService',
      'rpAppIsMobileViewService',
      rpMessageSidenavCtrl
    ]);
}());
