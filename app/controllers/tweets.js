'use strict';
const User = require('../models/user');
const Tweet = require('../models/tweet');
const sortHelper = require('../utils/sort')

exports.home = {

  handler: function (request, reply) {
    const userId = request.auth.credentials.loggedInUser;
    let userTweets = null;
    Tweet.find({ tweetUser: userId }).populate('tweetUser').then(allUserTweets => {
      userTweets = sortHelper.sortDateTimeNewToOld(allUserTweets);
      return User.findOne({ _id: userId });
    }).then(foundUser => {
      reply.view('dashboard', {
        title: 'Tweet | Dashboard',
        tweets: userTweets,
        user: foundUser,
        isCurrentUser: true,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.addTweet = {

  handler: function (request, reply) {
    const userId = request.params.userid;
    let tweetData = request.payload;
    tweetData.tweetUser = userId;
    console.log(tweetData);
    Tweet.create(tweetData).then(newTweet => {
      if (userId === request.auth.credentials.loggedInUser) {
        reply.redirect('/home');
      } else {
        reply.redirect('/viewUser/' + userId);
      }
    }).catch(err => {
      console.log('Tried to add tweet but Something went wrong :(');
      reply.redirect('/home');
    });
  },
};

exports.globalTimeline = {

  handler: function (request, reply) {
    Tweet.find({}).populate('tweetUser').then(allTweets => {
      reply.view('globalTimeLine', { tweets: sortHelper.sortDateTimeNewToOld(allTweets) });
    }).catch(err => {
      console.log('Tried to get all tweets but Something went wrong :(');
      reply.redirect('/home');
    });
  },
};

exports.deleteSpecificTweet = {

  handler: function (request, reply) {
    const tweetId = request.params.id;
    const userId = request.params.userid;
    Tweet.findOneAndRemove({ _id: tweetId }).then(success => {
      console.log('Successfully deleted tweet: ' + request.params.id);
      if (userId === request.auth.credentials.loggedInUser) {
        reply.redirect('/home');
      } else {
        reply.redirect('/viewUser/' + userId);
      }
    }).catch(err => {
      console.log('Tried to delete tweet: ' + tweetId + ' but something went wrong :(');
      reply.redirect('/home');
    });
  },
};

exports.deleteAllUserTweets = {

  handler: function (request, reply) {
    const userId = request.params.userid;
    Tweet.remove({ tweetUser: userId }).then(success => {
      console.log('Successfully deleted all tweets with user id: ' + userId);
      if (userId === request.auth.credentials.loggedInUser) {
        reply.redirect('/home');
      } else {
        reply.redirect('/viewUser/' + userId);
      }
    }).catch(err => {
      console.log('Tried to delete all tweets with user id : ' + userId + ' but something went wrong :(');
      reply.redirect('/home');
    });
  },
};

exports.viewUserTimeline = {

  handler: function (request, reply) {
    const userId = request.params.id;
    if (userId === request.auth.credentials.loggedInUser) {
      reply.redirect('/home');
    } else {
      let tweetsFound = null;
      Tweet.find({ tweetUser: userId }).populate('tweetUser').then(userTweets => {
        console.log('Successfully found all tweets with user id: ' + userId);
        tweetsFound = sortHelper.sortDateTimeNewToOld(userTweets);
        return User.findOne({ _id: userId });
      }).then(foundUser => {
        reply.view('dashboard', {
          title: foundUser.firstName + ' ' + foundUser.lastName + ' | TimeLine',
          tweets: tweetsFound,
          user: foundUser,
          isCurrentUser: false,
        });
      }).catch(err => {
        console.log('Tried to delete all tweets with user id : ' + userId + ' but something went wrong :(');
        reply.redirect('/home');
      });
    }
  },
};
