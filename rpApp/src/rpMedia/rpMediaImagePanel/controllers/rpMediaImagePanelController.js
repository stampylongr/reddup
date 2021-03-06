(function () {
  'use strict';

  function rpMediaImagePanelCtrl($scope, mdPanelRef, imageUrl) {
    console.log('[rpMediaImagePanelCtrl] imageUrl: ' + imageUrl);

    $scope.imageUrl = imageUrl;

    $scope.close = function (e) {
      console.log('[rpMediaImagePanelCtrl] close()');

      mdPanelRef.close()
        .then(function () {
          mdPanelRef.destroy();
        });
    };
  }

  angular.module('rpMediaImagePanel')
    .controller('rpMediaImagePanelCtrl', [
      '$scope',
      'mdPanelRef',
      'imageUrl',
      rpMediaImagePanelCtrl
    ]);
}());
