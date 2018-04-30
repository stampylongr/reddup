(function () {
  'use strict';

  function rpArticle() {
    return {
      restrict: 'C',
      templateUrl: 'rpArticle/views/rpArticle.html',
      controller: 'rpArticleCtrl',
      // replace: true,
      scope: {
        dialog: '=',
        post: '=',
        article: '=',
        subreddit: '=',
        comment: '=',
        animations: '='

      }
    };
  }

  angular.module('rpArticle')
    .directive('rpArticle', rpArticle);
}());
