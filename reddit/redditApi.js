var Snoocore = require('snoocore');
var when = require('when');
var config = require('./config.json');
var open = require('open');
var mongoose = require('mongoose');
var RedditApp = require('../models/redditApp.js');
var crypto = require('crypto');

var reddit = new Snoocore({
    userAgent: 'Snoocore Examples GitHub: https://github.com/trevorsenior/snoocore-examples',
    oauth: {
        type: 'explicit',
        duration: 'permanent', // will allow us to authenticate for longer periods of time
        consumerKey: config.oauthExplicit.consumerKey,
        consumerSecret: config.oauthExplicit.consumerSecret,
        redirectUri: config.oauthExplicit.redirectUri,
        scope: ['read']
    }
});

var state = crypto.randomBytes(32).toString('hex');

RedditApp.findOne({}, function(err, data){
    if (err) throw new error(err);
    if (data) {
        console.log("Using stored refresh token: " + results[0].refreshToken);

        reddit.refresh(data.refreshToken).then(function(){
            console.log('We are now authenticated!');
        });
    } else {
        open(reddit.getAuthUrl(state));
    }
});

exports.completeAuthorization = function(returnedState, code, error, callback) {
    console.log("[completeAuthorization] state: " + state + ", code: " + code);
    if (error) {
        console.log("Error occurred during authorization");
        console.error(error);
    }
    if (state !== returnedState) {
        console.log("Error states do not match...")
        console.error('Generated State:', state);
        console.error('Returned State:',returnedState);
    }
    reddit.auth(code).then(function(refreshToken){
        console.log("[completeAuthorization] refresh token: " + refreshToken);
        
        RedditApp.findOne({}, function(err, data) {
            if (err) throw new error(err);
            if (data) {
                data.refreshToken = refreshToken;
                data.save(function(err){
                    if (err) throw new error(err);
                    callback();
                });
            }
            else {
                var newRedditApp = new RedditApp();
                newRedditApp.refreshToken = refreshToken;
                newRedditApp.save(function(err){
                    if (err) throw new error(err);
                    callback();
                });
            }
        })
    });
}

exports.subreddit = function(sub, sort, postLimit, callback) {
    reddit('r/$subreddit/$sort').listing({
        $subreddit: sub,
        limit: postLimit,
        $sort: sort
    }).then(function(slice) {
        callback(slice);
    });
}

exports.subreddits = function (callback) {
    reddit('/subreddits/popular').get().then(function(data){
        // console.log(data);
        callback(data);
    });
}

function printSlice(slice) {
    slice.stickied.forEach(function(item, i) {
        console.log('**STICKY**', item.data.title.substring(0, 20) + '...');
    });

    slice.children.forEach(function(child, i) {
        console.log(slice.count + i + 1, child.data.title.substring(0, 20) + '...');
    });
}