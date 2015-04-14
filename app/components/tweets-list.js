import Ember from 'ember';

export default Ember.Component.extend({
  
  tweetLimit: 3,

  limitedTweets: function() {
    return this.get('tweets').slice(0, this.get('tweetLimit'));
  }.property('tweets', 'tweetLimit'),
});
