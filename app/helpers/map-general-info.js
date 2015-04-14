import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(dataInfo, dataset) {
  return new Ember.Handlebars.SafeString(dataInfo[dataset][0].data_set_name);
});
