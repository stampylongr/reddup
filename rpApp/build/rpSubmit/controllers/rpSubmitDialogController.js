'use strict';

(function () {
	'use strict';

	angular.module('rpSubmit').controller('rpSubmitDialogCtrl', ['$scope', '$location', '$mdDialog', 'rpSettingsService', 'subreddit', rpSubmitDialogCtrl]);

	function rpSubmitDialogCtrl($scope, $location, $mdDialog, rpSettingsService, subreddit) {

		console.log('[rpSubmitDialogCtrl] subreddit: ' + subreddit);

		$scope.animations = rpSettingsService.settings.animations;

		$scope.isDialog = true;

		if (!subreddit || subreddit !== 'all') {
			$scope.subreddit = subreddit;
		}
		console.log('[rpSubmitDialogCtrl] $scope.subreddit: ' + subreddit);

		//Close the dialog if user navigates to a new page.
		var deregisterLocationChangeSuccess = $scope.$on('$locationChangeSuccess', function () {
			$mdDialog.hide();
		});

		$scope.$on('$destroy', function () {
			deregisterLocationChangeSuccess();
		});
	}
})();