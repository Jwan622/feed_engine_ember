import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return Ember.RSVP.hash({
      tweets: Ember.$.getJSON(`/api/v1/${params.dataset}/tweets`),
      data: Ember.$.getJSON(`/api/v1/${params.dataset}/data`)
    });
  },

});
