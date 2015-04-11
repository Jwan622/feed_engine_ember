export default Ember.Handlebars.makeBoundHelper(function(value, options) {
  if (value === null) {
    return new Ember.Handlebars.SafeString('0.0');
  }
  return new Ember.Handlebars.SafeString(parseFloat(value, 10).toFixed(1));
});
