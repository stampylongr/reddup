'use strict';

(function () {
	'use strict';

	angular.module('rpComment').factory('rpCommentCommentsService', ['rpAppRedditApiService', rpCommentCommentsService]);

	function rpCommentCommentsService(rpAppRedditApiService) {
		return function (subreddit, article, sort, comment, context, callback) {
			console.log('[rpCommentCommentsService] request comments');
			console.log('[rpCommentCommentsService] subreddit: ' + subreddit);
			console.log('[rpCommentCommentsService] article: ' + article);
			console.log('[rpCommentCommentsService] sort: ' + sort);
			console.log('[rpCommentCommentsService] comment: ' + comment);
			console.log('[rpCommentCommentsService] context: ' + context);

			var params = {
				$subreddit: subreddit,
				$article: article,
				comment: comment,
				context: context,
				showedits: true,
				showmore: true,
				sort: sort
			};

			if (angular.isUndefined(comment) || comment === "") {
				params.depth = 7;
			}
			console.log('[rpCommentCommentsService] depth: ' + params.depth);

			rpAppRedditApiService.redditRequest('get', '/r/$subreddit/comments/$article', params, function (data) {

				if (data.responseError) {
					console.log('[rpCommentService] responseError: ' + JSON.stringify(data));
					callback(data, null);
				} else {
					callback(null, data);
				}
			});
		};
	}
})();