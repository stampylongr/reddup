(function () {
  'use strict';

  function rpSlideshowSettingsPanelCtrl(
    $scope,
    $rootScope,
    $timeout,
    rpSettingsService
  ) {
    console.log('[rpSlideshowSettingsCtrl]');

    // required or else view bindings don't get set correctly.
    $timeout(() => {
      this.settings = rpSettingsService.getSettings();
    }, 0);

    $scope.settingChanged = function () {
      // works to trigger save settings
      rpSettingsService.setSettings(rpSettingsService.settings);
    };

    $scope.$on('$destroy', function () {
      $rootScope.$emit('rp_slideshow_show_header');
    });
  }

  angular
    .module('rpSlideshow')
    .controller('rpSlideshowSettingsPanelCtrl', [
      '$scope',
      '$rootScope',
      '$timeout',
      'rpSettingsService',
      rpSlideshowSettingsPanelCtrl
    ]);
}());
