(function () {
  'use strict';

  function rpSubmitFormCtrl(
    $scope,
    $rootScope,
    $interval,
    $timeout,
    $mdDialog,
    $window,
    rpSubmitService,
    rpSubredditsService,
    rpAppLocationService,
    rpToolbarButtonVisibilityService
  ) {
    var resetSudreddit = false;
    var countdown;

    console.log('[rpSubmitFormCtrl] rpSubredditsService.currentSub: ' +
        rpSubredditsService.currentSub);
    console.log('[rpSubmitFormCtrl] $scope.subreddit: ' + $scope.subreddit);
    console.log('[rpSubmitFormCtrl] $scope.isFeedback: ' + $scope.isFeedback);

    if ($scope.subreddit || rpSubredditsService.currentSub !== '') {
      $scope.inSubreddit = true;
    }

    if (!$scope.isDialog && $scope.subreddit) {
      rpToolbarButtonVisibilityService.showButton('showRules');
    }

    if ($scope.isFeedback) {
      $scope.subreddit = 'reddupco';
      $scope.text = '';
    }

    if (!$scope.subreddit) {
      resetSudreddit = true;
    }

    function clearForm() {
      $scope.title = '';
      $scope.url = '';
      $scope.text = '';
      $scope.sendreplies = true;
      $scope.iden = '';

      if (resetSudreddit) {
        $scope.subreddit = '';
      }

      $scope.showSubmit = true;
      $scope.showRatelimit = false;
      $scope.showAnother = false;
      $scope.showRepost = false;
      $scope.showMessage = false;
      $scope.showButtons = true;
      $scope.showFeedback = false;
      $scope.feedbackIcon = '';
      $scope.showFeedbackIcon = false;
      $scope.feedbackLink = '';
      $scope.feedbackLinkName = '';
      $scope.showFeedbackLink = false;
      $scope.feedbackMessage = '';

      if ($scope.rpSubmitNewLinkForm) {
        $scope.rpSubmitNewLinkForm.$setUntouched();
      }
    }

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(sub) {
        return sub.data.display_name.indexOf(lowercaseQuery) === 0;
      };
    }

    clearForm();

    $scope.subSearch = function () {
      return $scope.subreddit
        ? rpSubredditsService.subs.filter(createFilterFor($scope.subreddit))
        : [];
    };

    $scope.resetForm = function () {
      clearForm();
    };

    $scope.submitLink = function (e) {
      var kind = $scope.url ? 'link' : 'self';

      $scope.showProgress = true;
      $scope.showButtons = false;
      $scope.showFeedback = false;

      // blur input fields.

      console.log('[rpSubmitFormCtrl] e.target.elements: ' + e.target.elements);

      e.target.elements.submitTitleInput.blur();

      if (e.target.elements.submitSubredditInput) {
        e.target.elements.submitSubredditInput.blur();
      }
      if (e.target.elements.submitUrlInput) {
        e.target.elements.submitUrlInput.blur();
      }
      if (e.target.elements.submitTextInput) {
        e.target.elements.submitTextInput.blur();
      }

      console.log('[rpSubmitFormCtrl] submit, $scope.subreddit: ' + $scope.subreddit);

      rpSubmitService(
        kind,
        $scope.resubmit,
        $scope.sendreplies,
        $scope.subreddit,
        $scope.text,
        $scope.title,
        $scope.url,
        $scope.iden,
        function (err, data) {
          if ($scope.isFeedback) {
            $scope.subreddit = 'reddupco';
          }

          $scope.showProgress = false;
          $timeout(angular.noop, 0);

          console.log(`[rpSubmitFormCtrl] err: ${JSON.stringify(err)}`);
          console.log(`[rpSubmitFormCtrl] data: ${JSON.stringify(data)}`);

          if (err) {
            console.log('[rpSubmitFormCtrl] err');

            if (err.errors.length > 0) {
              // ratelimit error. (Still untested)
              if (err.errors[0][0] === 'RATELIMIT') {
                $scope.showSubmit = false;
                $scope.showRatelimit = true;

                let duration = err.ratelimit;

                countdown = $interval(function () {
                  console.log('[rpSubmitFormCtrl] submit rampup interval');

                  let minutes = parseInt(duration / 60, 10);
                  let seconds = parseInt(duration % 60, 10);

                  minutes = minutes < 10 ? '0' + minutes : minutes;
                  seconds = seconds < 10 ? '0' + seconds : seconds;

                  $scope.rateLimitTimer = minutes + ':' + seconds;

                  if (--duration < 0) {
                    $scope.showRatelimit = false;
                    $scope.feedbackIcon = 'mood';
                    $scope.feedbackMessage =
                      'alright, you should be able to post now, give it another go.';
                    $scope.showSubmit = true;
                    $interval.cancel(countdown);
                  }
                }, 1000);

                $scope.feedbackMessage = err.errors[0][1];
                $scope.feedbackIcon = 'error_outline';
                $scope.showFeedbackIcon = true;
                $scope.showFeedbackLink = false;
                $scope.showFeedback = true;
                $scope.showButtons = true;
              } else if (err.errors[0][0] === 'QUOTA_FILLED') {
                // console.log('[rpSubmitFormCtrl] QUOTA_FILLED ERROR');
                $scope.feedbackMessage = err.errors[0][1];
                $scope.feedbackIcon = 'error_outline';
                $scope.showFeedbackIcon = true;
                $scope.showFeedbackLink = false;
                $scope.showFeedback = true;
                $scope.showSubmit = false;
                $scope.showButtons = true;
              } else if (err.errors[0][0] === 'BAD_CAPTCHA') {
                $scope.feedbackMessage =
                  'you entered the CAPTCHA incorrectly. Please try again.';
                $scope.feedbackIcon = 'error_outline';
                $scope.showFeedbackIcon = true;
                $scope.showFeedbackLink = false;
                $scope.showFeedback = true;
                $scope.showButtons = true;
              } else if (err.errors[0][0] === 'ALREADY_SUB') {
                // console.log('[rpSubmitFormCtrl] repost error: ' + JSON.stringify(data));

                // $scope.feedbackLink = data;
                // $scope.feedbackLinkName = "The link";
                // $scope.feedbackMessage = "you tried to submit has been submitted to this subreddit before";

                $scope.resubmit = true;

                $scope.feedbackMessage = err.errors[0][1];
                $scope.feedbackIcon = 'error_outline';
                $scope.showFeedbackIcon = true;
                $scope.showFeedbackLink = false;
                $scope.showFeedback = true;
                $scope.showSubmit = false;
                $scope.showRepost = true;
                $scope.showButtons = true;
              } else {
                // Catches unspecififed errors or ones that do not require special handling.
                // Catches, SUBREDDIT_ERROR.
                console.log('[rpSubmitFormCtrl] error catchall: ' +
                    JSON.stringify(responseErrorBody));
                $scope.feedbackMessage = err.errors[0][1];
                $scope.feedbackIcon = 'error_outline';
                $scope.showFeedbackIcon = true;
                $scope.showFeedbackLink = false;
                $scope.showFeedback = true;
                $scope.showSubmit = true;
                $scope.showButtons = true;

                // $timeout(angular.noop, 0);
              }
            } else if (!err.data.url) {
              // console.log('[rpSubmitFormCtrl] garbage url error occurred.');

              $scope.feedbackMessage =
                'something went wrong trying to post your link.\n check the url, wait a few minutes and try again.';
              $scope.showFeedbackLink = false;
              $scope.showFeedback = true;
              $scope.feedbackIcon = 'error_outline';
              $scope.showFeedbackIcon = true;
              $scope.showButtons = true;
            }
          } else {
            // Successful Post :)
            const FEEDBACK_LINK_RE = /^https?:\/\/www\.reddit\.com\/r\/([\w]+)\/comments\/([\w]+)\/(?:[\w]+)\//i;
            let groups = FEEDBACK_LINK_RE.exec(data.data.url);
            console.log('[rpSubmitFormCtrl] successful submission, data: ' +
                JSON.stringify(data));

            if (groups) {
              $scope.feedbackLink =
                '/r/' + groups[1] + '/comments/' + groups[2];
            }

            $scope.feedbackLinkName = 'Your post';
            $scope.feedbackMessage = 'was submitted successfully.';
            $scope.feedbackIcon = 'sentiment_very_satisfied';
            $scope.showFeedbackIcon = true;
            $scope.showProgress = false;
            $scope.showFeedbackLink = true;
            $scope.showFeedback = true;
            $scope.showRepost = false;
            $scope.showSubmit = false;
            $scope.showAnother = true;
            $scope.showButtons = true;
          }
        }
      );

      $scope.$on('$destroy', function () {
        $interval.cancel(countdown);
      });
    };

    $scope.closeDialog = function () {
      console.log('[rpSubmitFormCtrl] closeDialog(), $scope.isDialog: ' + $scope.isDialog);

      if ($scope.isDialog) {
        $mdDialog.hide();
      } else if ($window.history.length > 1) {
        $window.history.back();
      } else {
        rpAppLocationService(null, '/', '', true, false);
      }
    };

    function startRateLimitTimer(duration) {
      $scope.rateLimitSubmitDisabled = true;
      console.log('[rpSubmitFormCtrl] duration: ' + duration);
    }

    $scope.$on('$destroy', function () {});
  }

  angular
    .module('rpSubmit')
    .controller('rpSubmitFormCtrl', [
      '$scope',
      '$rootScope',
      '$interval',
      '$timeout',
      '$mdDialog',
      '$window',
      'rpSubmitService',
      'rpSubredditsService',
      'rpAppLocationService',
      'rpToolbarButtonVisibilityService',
      rpSubmitFormCtrl
    ]);
}());
