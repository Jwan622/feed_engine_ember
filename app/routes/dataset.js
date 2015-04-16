import Ember from 'ember';
import ENV from 'usausa-ember/config/environment'

const url = ENV.apiUrl;

export default Ember.Route.extend({
  model: function(params) {
    return Ember.RSVP.hash({
      tweets: Ember.$.getJSON(`${url}/api/v1/${params.dataset}/tweets`),
      data: Ember.$.getJSON(`${url}/api/v1/${params.dataset}/data`),
      dataInfo: Ember.$.getJSON(`${url}/api/v1/${params.dataset}`),
      dataset: params.dataset
    });
  },
});
