var Snoocore = require('snoocore');
var when = require('when');
var open = require('open');
var config = require('./config.json');
var RedditApp = require('../models/redditApp.js');
var crypto = require('crypto');

var serverGeneratedState = crypto.randomBytes(32).toString('hex');
var redditServer = new Snoocore(config.serverConfig);

redditServer.on('access_token_expired', function(){
    console.log('ACCESS TOKEN EXPIRED');
    refreshServer();
});

RedditApp.findOne({}, function(err, data){
    if (err) throw new error(err);
    if (data) {
        redditServer.refresh(data.refreshToken).then(function(){
            console.log('We are now authenticated!');
        });
    } else {
        open(redditServer.getExplicitAuthUrl(serverGeneratedState));
    }
});

function refreshServer() {
    RedditApp.findOne({}, function(err, data){
        if (err) throw new error(err);
        if (data) {
            redditServer.refresh(data.refreshToken).then(function(){
                console.log('We are now authenticated!');
            });
        }
    });
};

exports.getRedditServer = function() {
    return when.resolve(redditServer);
};

exports.completeServerAuth = function(returnedState, code, error, callback) {

    if (serverGeneratedState !== returnedState) {
        console.log("Error states do not match...");
        console.error('Server Generated State:', state);
        console.error('Returned State:',returnedState);
    }
    redditServer.auth(code).then(function(refreshToken){
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
        });
    });
};