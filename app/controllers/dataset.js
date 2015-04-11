import Ember from 'ember';

export default Ember.Controller.extend({
  tweets: Ember.computed.alias('model.tweets.tweets'),
  sentimentScore: Ember.computed.alias('model.tweets.sentiment.average'),

  sentimentScoreDisplay: function() {
    var score = this.get('sentimentScore');
    return parseFloat(score, 10).toFixed(2);
  }.property('sentimentScore')
});
