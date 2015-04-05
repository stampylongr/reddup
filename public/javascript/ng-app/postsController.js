'use strict';

/*
	Subreddit Posts Controller
	sets posts for given subreddit.
 */
angular.module('redditPlusPostsController', []).controller('postsCtrl',
	[
		'$scope',
		'$rootScope',
		'$routeParams',
		'$log',
		'$window',
		'$timeout',
		'Posts',
		'titleChangeService',
		'subredditService',
		'$mdToast',
		'voteService',

		function($scope, $rootScope, $routeParams, $log, $window, $timeout,
			Posts, titleChangeService, subredditService, $mdToast, voteService) {

			// $scope.$watch(function(){
			// 	return $window.innerWidth;
			// }, function(value){
			// 		if (value > 1550) {
			// 			// $log.log("Changing to 3 columns, window size: " + value);
			// 			$scope.columns = [1, 2, 3];
			// 		} else if (value > 970) {
			// 			// $log.log("Changing to 2 columns, window size: " + value);
			// 			$scope.columns = [1, 2];
			// 		} else {
			// 			// $log.log("Changing to 1 column, window size: " + value);
			// 			$scope.columns = [1];
			// 		}
			// });

			// if(!$scope.columns){
			// 	var value = $window.innerWidth;
			// 	if (value > 1550) {
			// 		$scope.columns = [1, 2, 3];
			// 	} else if (value > 970) {
			// 		$scope.columns = [1, 2];
			// 	} else {
			// 		$scope.columns = [1];
			// 	}
			// }

			var sort = $routeParams.sort ? $routeParams.sort : 'hot';
			var sub = $routeParams.sub ? $routeParams.sub : 'all';
			var t;
			var loadingMore = false;
			$scope.showSub = true;
			$scope.havePosts = false;

			if (sub == 'all'){
				$scope.showSub = true;
				titleChangeService.prepTitleChange('reddit: the frontpage of the internet');
			}
			else{
				$scope.showSub = false;
				titleChangeService.prepTitleChange('r/' + sub);
			}
			subredditService.prepSubredditChange(sub);

			$rootScope.$emit('tab_change', sort);

			/*
				Loading Posts
			 */

			$rootScope.$emit('progressLoading');
			Posts.query({sub: sub, sort: sort}, function(data){
				$rootScope.$emit('progressComplete');
				data.forEach(function(post) { 
					post.data.rp_type = mediaType(post.data);
				});
				$scope.posts = data;
				$scope.havePosts = true;
				$timeout(function () { $scope.$broadcast('masonry.reload'); }, 100);
			});



			$scope.morePosts = function() {
				if ($scope.posts && $scope.posts.length > 0){
					var lastPostName = $scope.posts[$scope.posts.length-1].data.name;
					if(lastPostName && !loadingMore){
						loadingMore = true;
						$rootScope.$emit('progressLoading');
						Posts.query({sub: sub, sort: sort, after: lastPostName}, function(data){
							data.forEach(function(post){ post.data.rp_type = mediaType(post.data); });
							Array.prototype.push.apply($scope.posts, data);
							loadingMore = false;
							$rootScope.$emit('progressComplete');
						});
					}
				}
			};

			$rootScope.$on('t_click', function(e, time){
				t = time;
				Posts.query({sub: sub, sort: sort, t: t}, function(data){
					$scope.posts = data;
				});
			});

			$rootScope.$on('tab_click', function(e, tab){
				sort = tab;
				$rootScope.$emit('tab_change', tab);
				$rootScope.$emit('progressLoading');
				Posts.query({sub: sub, sort: sort}, function(data){
					data.forEach(function(post){ 
						post.data.rp_type = mediaType(post.data); 
						$log.log("rp_type: "+ post.data.rp_type);
					});
					$scope.posts = data;
					$rootScope.$emit('progressComplete');
				});
			});

			$scope.upvotePost = function(post) {
				var dir = post.data.likes ? 0 : 1;
				voteService.save({id: post.data.name, dir: dir}, function(data){
					$log.log(data);
					if (dir == 1)
						post.data.likes = true;
					else
						post.data.likes = null;
				});
			};

			$scope.showToast = function() {
				$mdToast.show({
					controller: 'toastCtrl',
					templateUrl: 'partials/rpToast',
					hideDelay: 3000,
					position: "top left"
				});
			};

			$scope.suspendColumns = function() {
				$log.log('postsController: suspendColumns');
				$scope.$broadcast('suspend_columns');
			};
		}
	]
);

function mediaType(data) {

	var url = data.url;
	var domain = data.domain;

	if (data.is_self)
	  return 'self';

	if (data.media) {
	  if (data.media.oembed.type == 'video') {
		if (data.media_embed)
		  return 'embed';
		else
		  return 'video';
	  }
	}

	if (data.domain == "twitter.com" && url.indexOf('/status/') > 0)
	  return 'tweet';

	if (url.substr(url.length-4) == '.jpg' || url.substr(url.length-4) == '.png')
	  return 'image';

	if (data.domain.indexOf('imgur.com') >= 0)
	  if (url.indexOf('/a/') > 0 || url.indexOf('/gallery/') > 0 ||
		url.substring(url.lastIndexOf('/')+1).indexOf(',') > 0) {
		return 'album';
	  }


	if (
			data.domain == "gfycat.com" ||
			url.substr(url.length-5) == '.gifv' ||
			url.substr(url.length-5) == '.webm' ||
			url.substr(url.length-4) == '.mp4' ||
			url.indexOf('.gif') > 0
		)
	  return 'video';

	if(domain.substr(domain.length-9) == 'imgur.com')
	  return 'image';

	return 'default';
}