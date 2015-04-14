import Ember from 'ember';

export default Ember.Component.extend({
  mapAttributes: {
    'poverty': 'percent_below_poverty',
    'education': '',
    'marital': '',
  },

  stateLookup: {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District Of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Palau': 'PW',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
  },

  width: 950,
  height: 500,

  didInsertElement: function() {
    var width = this.get('width'),
        height = this.get('height'),
        active = d3.select(null);

    var lookup = this.get('stateLookup')

    var projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);

    var zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(1)
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

    var path = d3.geo.path()
      .projection(projection);

    var svg = d3.select("#map").append("svg")
      .attr("width", width)
      .attr("height", height)
      .on("click", stopped, true);

    svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", reset);

    var g = svg.append("g");

    svg
      .call(zoom.event);

    d3.json("json/2010-us-20m.json", function(error, us) {
      g.selectAll("path")
        .data(us.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("click", clicked);
      this.renderData();
    }.bind(this));

    function clicked(d) {
      if (active.node() === this) return reset();
      active.classed("active", false);
      active = d3.select(this).classed("active", true);

      var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

      svg.transition()
        .duration(750)
        .call(zoom.translate(translate).scale(scale).event);
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      svg.transition()
        .duration(750)
        .call(zoom.translate([0, 0]).scale(1).event);
    }

    function zoomed() {
      g.style("stroke-width", 1.5 / d3.event.scale + "px");
      g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // If the drag behavior prevents the default click,
    // also stop propagation so we don’t click-to-zoom.
    function stopped() {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }

  },

  renderData: function() {
    var lookup = this.get('stateLookup');
    var map_attrs = this.get('mapAttributes');
    var data = this.get('data').data;

    var min = d3.min(data, function(d) {
      return d.percent_below_poverty;
    });

    var max = d3.max(data, function(d) {
      return d.percent_below_poverty
    });

    var q = d3.scale.ordinal().domain([min,max]).range(["map-q0", "map-q1",
      "map-q2", "map-q3", "map-q4", "map-q5", "map-q6", "map-q7", "map-q8"])

    d3.selectAll("path")
      .attr("class", function(d) {
        return `feature ${ lookup[d.properties.NAME] }`
      })
      .attr("class", function(d) {
        var state = lookup[d.properties.NAME];
        if (!state) { return "" }
        var percent = data.filter(function(state_data) {
          return state_data.state === state;
        })[0].percent_below_poverty;

        return `feature ${ q(percent) }`;
      })
  }.observes('data')
});
