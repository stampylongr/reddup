'use strict';

/* Controllers */

var redditPlusControllers = angular.module('redditPlusControllers', []);

/*
  Top level controller. 
  controls sidenav toggling. (This might be better suited for the sidenav controller no?)
 */
redditPlusControllers.controller('AppCtrl', ['$scope', '$timeout', '$mdSidenav', '$log',
  function($scope, $timeout, $mdSidenav, $log) {
	$scope.toggleLeft = function() {
	  $mdSidenav('left').toggle();
	};

	$scope.close = function() {
	  $mdSidenav('left').close();
	};
  }
]);

redditPlusControllers.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function() {
	$mdSidenav('left').close();
  };
});

/*
  Toolbar controller handles title change through titleService.
 */
redditPlusControllers.controller('toolbarCtrl', ['$scope', '$log', 'titleChangeService',
  function($scope, $log, titleChangeService) {
	$scope.toolbarTitle = 'reddit+';
	$scope.$on('handleTitleChange', function(e, d) {
	  $scope.toolbarTitle = titleChangeService.title;
	});
  }
]);

redditPlusControllers.controller('tabsCtrl', ['$scope', '$rootScope', '$log', 'subredditService',
  function($scope, $rootScope, $log, subredditService) {
	$scope.subreddit = 'all';
	$scope.selectedIndex = 0;
	$scope.$on('handleSubredditChange', function(e, d){
	  $scope.subreddit = subredditService.subreddit;
	});

	$rootScope.$on('tabChange', function(e, tab){
		switch(tab) {
			case 'hot':
				$scope.selectedIndex = 0;
				break;
			case 'new':
				$scope.selectedIndex = 1;
				break;
			case 'rising':
				$scope.selectedIndex = 2;
				break;
			case 'controversial':
				$scope.selectedIndex = 3;
				break;
			case 'top':
				$scope.selectedIndex = 4;
				break;
			default:
				$scope.selectedIndex = 0;
				break;
		}
	});
  }
]);

/*
  Index controller, startpage, queries posts from r/all
  calls titlechangeservice to change toolbar title.
  might not be necessary if we can change subredditPostsCtrl to use frontpage on default....
 */
redditPlusControllers.controller('indexCtrl', ['$scope', '$routeParams', 'Posts', 'titleChangeService', 'subredditService',
  function($scope, $routeParams, Posts, titleChangeService, subredditService) {
	  $scope.posts = Posts.query(function(){
		titleChangeService.prepTitleChange('r/all');
		subredditService.prepSubredditChange('all');
	  });
  }
]);

redditPlusControllers.controller('identityCtrl', ['$scope', 'identityService', 
  function($scope, identityService){
	$scope.identity = identityService.query();
  }]
);

/*
  Subreddit Posts Controller
  sets posts for given subreddit.
 */
redditPlusControllers.controller('subredditPostsSortCtrl', ['$scope', '$rootScope','$routeParams', '$log', 'Posts', 'titleChangeService', 'subredditService', 
  function($scope, $rootScope, $routeParams, $log, Posts, titleChangeService, subredditService) {
	var sort = $routeParams.sort ? $routeParams.sort : 'hot';
	var sub = $routeParams.sub ? $routeParams.sub : 'all';
	var loadingMore = false;

	titleChangeService.prepTitleChange('r/' + sub);
	subredditService.prepSubredditChange(sub);

	$rootScope.$emit('tabChange', sort);
	
	Posts.query({sub: sub, sort: sort}, function(data){
		$scope.posts = data;
	});

	$scope.morePosts = function() {
		if ($scope.posts && $scope.posts.length > 0){
			var lastPostName = $scope.posts[$scope.posts.length-1].data.name;
			if(lastPostName && !loadingMore){
				loadingMore = true;
				Posts.query({sub: sub, sort: sort, after: lastPostName}, function(data){
					Array.prototype.push.apply($scope.posts, data);
					loadingMore = false;
				});
			}
		}
	};
  }
]);

/*
  Post Media Controller
  controls revealing an embedded video 
 */
redditPlusControllers.controller('embedCtrl', ['$scope', '$log',
  function($scope, $log) {
	
	$scope.post.showEmbed = false;
	
	$scope.show = function() {
	  $scope.post.showEmbed = true;
	};

	$scope.hide = function() {
	  $scope.post.showEmbed = false;
	};

  }
]);

/*
  Post Media Controller
  controls revealing a video 
 */
redditPlusControllers.controller('videoCtrl', ['$scope', '$log',
  function($scope, $log) {
	
	$scope.post.showVideo = false;
	
	$scope.show = function() {
	  $scope.post.showVideo = true;
	};

	$scope.hide = function() {
	  $scope.post.showVideo = false;
	};

  }
]);

redditPlusControllers.controller('tweetCtrl', ['$scope', '$log', 'tweetService', 
  function($scope, $log, tweetService) {
	$scope.tweet = "";
	var id = $scope.post.data.url.substring($scope.post.data.url.lastIndexOf('/')+1);
	var data = tweetService.query({id: id}, function(data){
	  $scope.tweet = data.html;
	  twttr.widgets.load();
	});
  }
]);

/*
  Sidenav Subreddits-User Controller
  Gets user subscribed subreddits.
 */
redditPlusControllers.controller('sidenavSubredditsUserCtrl', ['$scope', 'SubredditsUser',
  function($scope, SubredditsUser){
	$scope.subs = SubredditsUser.query();
  }
]);

/*
  Sidenav Subreddits Controller
  Gets popular subreddits.
 */
redditPlusControllers.controller('sidenavSubredditsCtrl', ['$scope', 'Subreddits',
  function($scope, Subreddits){
	$scope.subs = Subreddits.query();
  }
]);

/*
  Imgur Album Info, [not working]
 */
redditPlusControllers.controller('imgurAlbumCtrl', ['$scope', '$log', '$routeParams', 'imgurAlbumService', 
  function($scope, $log, $routeParams, imgurAlbumService){
	var imageIndex = 0;
	$scope.currentImage = 0;
	$scope.currentImageUrl = "";
	$scope.imageDescription = "";
	$scope.imageTitle = "";

	var url = $scope.post.data.url;

	//get last segment of url and remove unwanted stuff
	if (url.indexOf('/gallery/') > 0) {
	  if (url.indexOf('/new') > 0) {
		url = url.substring(0, url.indexOf('/new'));
	  }
	}

	var id = url.substring(url.lastIndexOf('/')+1).replace('?gallery', '').replace('#0', '');

	//set the album info
	if (id.indexOf(',') > 0) { //implicit album (comma seperated list of image ids)
	  var images = [];
	  var imageIds = id.split(',');
	  imageIds.forEach(function(value, i){
		images.push({"link" : "http://i.imgur.com/" + value + ".jpg"});
	  });

	  $scope.album = {
		"data" : {
		  "images_count": imageIds.length,
		  "images": images
		}
	  };
	  setCurrentImage();

	} else { //actual album, request album info from api
	  imgurAlbumService.query({id: id}, function(album) {
		$scope.album = album;
		setCurrentImage();
	  }, function(error) {
		  var images = [];
		  images[0] = {
			"link": 'http://i.imgur.com/' + id + '.jpg'
		  }
		  $log.log(images[0]);
		  $scope.album = {
			"data" : {
			  "images_count": 1,
			  "images": images
			}
		  };
		  setCurrentImage();
	  });
	}

	$scope.prev = function(n) {
	  if(--imageIndex < 0)
		imageIndex = n-1;
	  setCurrentImage();
	};

	$scope.next = function(n) {
	  if(++imageIndex == n)
		imageIndex = 0;
	  setCurrentImage();
	};

	function setCurrentImage() {
	  $scope.currentImageUrl = $scope.album.data.images[imageIndex].link;
	  $scope.imageDescription = $scope.album.data.images[imageIndex].description;
	  $scope.imageTitle = $scope.album.data.images[imageIndex].title;
	  $scope.currentImage = imageIndex+1;
	}

  }
]);

// redditPlusControllers.controller('imgurAlbumCtrl', ['$scope', '$routeParams', '$log', 'imgAlbumService', 
//   function($scope, $routeParams, $log, imgurAlbumService){
//     $log.log('[imgurAlbumCtrl]');
//   }
// ]);

/*
  Progress bar controller. 
  based on https://github.com/chieffancypants/angular-loading-bar
  need to adjust increment numbers, loading bar can finish then jump back when refreshing.
 */
redditPlusControllers.controller('progressCtrl', ['$scope', '$rootScope', '$log', '$timeout',
  function($scope, $rootScope, $log, $timeout){
	$scope.value = 0.2;
	$scope.loading = true;
	var incTimeout = 0;

	$rootScope.$on('progressLoading', function(e, d){
	  // $log.log('progressLoading');
	  $scope.loading = true;
	  set(0.2)
	});
	$rootScope.$on('progressComplete', function(e,d){
	  // $log.log('progressComplete');
	  set(100);
	  $timeout(function(){
		$scope.loading = false;
	  }, 600);
	});
	$rootScope.$on('progress', function(e, d){
	  // $log.log('progress: ' + d.value);
	  set(d.value);
	});

	function set(n) {
	  if($scope.loading == false) return;
	  $scope.value = n;

	  $timeout.cancel(incTimeout);
	  incTimeout = $timeout(function(){
		inc();
	  }, 750);
	}


	function inc() {
	  var rnd = 0;
		// TODO: do this mathmatically instead of through conditions
		var stat = $scope.value/100;
		if (stat >= 0 && stat < 0.25) {
		  // Start out between 3 - 6% increments
		  rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
		} else if (stat >= 0.25 && stat < 0.65) {
		  // increment between 0 - 3%
		  rnd = (Math.random() * 3) / 100;
		} else if (stat >= 0.65 && stat < 0.9) {
		  // increment between 0 - 2%
		  rnd = (Math.random() * 2) / 100;
		} else if (stat >= 0.9 && stat < 0.99) {
		  // finally, increment it .5 %
		  rnd = 0.005;
		} else {
		  // after 99%, don't increment:
		  rnd = 0;
		}
		// $log.log("RANDOM INC: " + rnd*1000);
		$scope.value += rnd*250;
	}
  }
]);