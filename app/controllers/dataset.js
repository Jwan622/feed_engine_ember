import Ember from 'ember';

export default Ember.Controller.extend({
  tweets: Ember.computed.alias('model.tweets.tweets'),
  sentimentScore: Ember.computed.alias('model.tweets.sentiment.average'),

  limitedTweets: function() {
    return this.get('tweets').slice(0,3);
  }.property('tweets')
});
