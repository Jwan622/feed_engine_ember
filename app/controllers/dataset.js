import Ember from 'ember';

export default Ember.Controller.extend({
  tweets: Ember.computed.alias('model.tweets.tweets'),
  data: Ember.computed.alias('model.data'),
  sentimentScore: Ember.computed.alias('model.tweets.sentiment.average'),
});
