import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(value) {
  if (value > 0) {
    return new Ember.Handlebars.SafeString('pos-sentiment');
  } else if (value < 0) {
    return new Ember.Handlebars.SafeString('neg-sentiment');
  } else {
    return new Ember.Handlebars.SafeString('');
  }
});
