import Ember from 'ember';

export default Ember.Route.extend({
  dataset: null,

  model: function(params) {
    this.set('dataset', params.dataset);
    return params.dataset;
  },

  setupController: function(controller, model) {
    controller.set('dataset', this.get('dataset'));
  }
});
