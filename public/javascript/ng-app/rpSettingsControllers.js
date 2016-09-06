'use strict';

var rpSettingsControllers = angular.module('rpSettingsControllers', []);

rpSettingsControllers.controller('rpSettingsDialogCtrl', [
    '$scope',
    '$rootScope',
    '$location',
    '$timeout',
    '$mdDialog',
    'rpSettingsUtilService',

    function(
        $scope,
        $rootScope,
        $location,
        $timeout,
        $mdDialog,
        rpSettingsUtilService
    ) {

        $scope.animations = rpSettingsUtilService.settings.animations;

        $scope.isDialog = true;

        //Close the dialog if user navigates to a new page.
        var deregisterLocationChangeSuccess = $scope.$on('$locationChangeSuccess', function() {
            $mdDialog.hide();
        });

        $scope.$on('$destroy', function() {
            deregisterLocationChangeSuccess();
        });

    }
]);

rpSettingsControllers.controller('rpSettingsCtrl', [
    '$scope',
    '$rootScope',
    'rpSettingsUtilService',
    'rpTitleChangeUtilService',
    'rpUserFilterButtonUtilService',
    'rpUserSortButtonUtilService',
    'rpSubscribeButtonUtilService',
    'rpSearchFilterButtonUtilService',
    'rpSidebarButtonUtilService',
    'rpPostFilterButtonUtilService',
    'rpRefreshButtonUtilService',
    'rpSearchFormUtilService',

    function(
        $scope,
        $rootScope,
        rpSettingsUtilService,
        rpTitleChangeUtilService,
        rpUserFilterButtonUtilService,
        rpUserSortButtonUtilService,
        rpSubscribeButtonUtilService,
        rpSearchFilterButtonUtilService,
        rpSidebarButtonUtilService,
        rpPostFilterButtonUtilService,
        rpRefreshButtonUtilService,
        rpSearchFormUtilService
    ) {

        console.log('[rpSettingsCtrl]');

        $scope.settings = rpSettingsUtilService.getSettings();

        $scope.themes = [{
                name: 'blue',
                value: 'default'
            }, {
                name: 'indigo',
                value: 'indigo'
            }, {
                name: 'green',
                value: 'green'
            }, {
                name: 'deep-orange',
                value: 'deep-orange'
            }, {
                name: 'red',
                value: 'red'
            }, {
                name: 'pink',
                value: 'pink'
            }, {
                name: 'purple',
                value: 'purple'
            }

        ];

        if (!$scope.isDialog) {
            rpTitleChangeUtilService('Settings', true, true);
            rpUserFilterButtonUtilService.hide();
            rpUserSortButtonUtilService.hide();
            rpSearchFormUtilService.hide();
            rpSearchFilterButtonUtilService.hide();
            rpRefreshButtonUtilService.hide();
            rpPostFilterButtonUtilService.hide();
            rpSubscribeButtonUtilService.hide();
            $rootScope.$emit('rp_tabs_hide');

        }

        $scope.settingChanged = function() {
            // rpSettingsUtilService.setSetting(setting, value);
            rpSettingsUtilService.setSettings($scope.settings);
        };

        var deregisterSettingsChanged = $rootScope.$on('rp_settings_changed', function() {
            $scope.settings = rpSettingsUtilService.getSettings();
        });

        $scope.$on('$destroy', function() {
            deregisterSettingsChanged();
        });

    }
]);

rpSettingsControllers.controller('rpSettingsSidenavCtrl', ['$scope', '$rootScope', '$mdDialog', 'rpSettingsUtilService', 'rpLocationUtilService',
    function($scope, $rootScope, $mdDialog, rpSettingsUtilService, rpLocationUtilService) {


        $scope.showSettings = function(e) {
            console.log('[rpSettingsSidenavCtrl] $scope.$parent.animations: ' + $scope.$parent.animations);

            if (rpSettingsUtilService.settings.settingsDialog) {
                $mdDialog.show({
                    controller: 'rpSettingsDialogCtrl',
                    templateUrl: 'rpSettingsDialog.html',
                    targetEvent: e,
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    cloaseTo: '#dialog-anchor'
                });

            } else {
                rpLocationUtilService(null, '/settings', '', true, false);
            }

        };

        $scope.$on('$destroy', function() {});

    }
]);
