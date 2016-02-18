'use strict';

var rpLinkControllers = angular.module('rpLinkControllers', []);

rpLinkControllers.controller('rpLinkCtrl', ['$scope', '$filter', '$mdDialog', 'rpLocationUtilService',
	function($scope, $filter, $mdDialog, rpLocationUtilService) {

		$scope.isComment = $filter('rp_is_comment')($scope.post.data.name);
		// console.log('[rpLinkCtrl] $scope.isComment: ' + $scope.isComment);
		$scope.isMine = $scope.identity ? $scope.post.data.author === $scope.identity.name : false;

		/**
		 * CONTOLLER API
		 */
		$scope.thisController = this;

		this.completeDeleting = function(id) {
			console.log('[rpLinkCtrl] completeDeleting()');
			$scope.parentCtrl.completeDeleting(id);

		};

		this.completeReplying = function(data) {
			console.log('[rpLinkCtrl] completeReplying()');
			$scope.postComment = data.json.data.things[0];
			$scope.post.data.num_comments++;
		};

		this.watchHeight = function(data) {
			console.log('[rpLinkCtrl] watchHeight()');
			$scope.$emit('rp_angular_masonry_tile_watch_height');
		};

	}
]);