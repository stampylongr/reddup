'use strict';

var rpGildControllers = angular.module('rpGildControllers', []);

rpGildControllers.controller('rpGildButtonCtrl', [
    '$scope',
    'rpGildUtilService',
    'rpAuthService',
    'rpToastService',
    function(
        $scope,
        rpGildUtilService,
        rpAuthService,
        rpToastService

    ) {

        // console.log('[rpGildButtonCtrl]');

        $scope.gild = function() {

            if (rpAuthService.isAuthenticated) {

                rpGildUtilService($scope.redditId, function(err, data) {

                    if (err) {
                        console.log('[rpGildButtonCtrl] err');
                    } else {
                        console.log('[rpGildButtonCtrl] success');
                        $scope.gilded++;
                    }

                });

            } else {
                rpToastService("you must log in to gild posts", "sentiment_neutral");
            }
        };
    }
]);
