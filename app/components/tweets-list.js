import Ember from 'ember';

export default Ember.Component.extend({
  
  tweetLimit: 5,

  limitedTweets: function() {
    return this.get('tweets').slice(0, this.get('tweetLimit'));
  }.property('tweets', 'tweetLimit'),
});
