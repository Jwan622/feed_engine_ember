/* globals d3 */

import Ember from 'ember';

export default Ember.Component.extend({
  mapAttributes: {
    'poverty': 'percent_below_poverty',
    'education': 'college_or_above_percent',
    'marital': 'never_married_percentage',
    'migration': 'different_state_percent'
  },

  datasetNames: {
    'poverty': 'Poverty',
    'education': 'Education',
    'marital': 'Marriage',
    'migration': 'Migration'
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
  activeState: null,

  didInsertElement: function() {
    var width = this.get('width'),
        height = this.get('height'),
        active = d3.select(null),
        dataset = this.get('dataset'),
        stateLookup = this.get('stateLookup'),
        data = this.get('data');

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
        .attr("state", function(d) {
          return d.properties.NAME
        })
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
        .call(zoom.translate(translate).scale(scale).event)
        .each("end", addInfoBox);
    }

    function addInfoBox() {
      var g = svg.append("g")
        .attr("class", "info-container")

      g.append("rect")
        .attr("class", "info-box")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);
      
      setActiveState();
      generateTitle();
    }

    var setActiveState = function() {
      var state = active.data()[0].properties.NAME;
      this.set('activeState', state);
    }.bind(this)

    var removeActiveState = function() {
      this.set('activeState', null);
    }.bind(this)

    function generateTitle() {
      var g = d3.select(".info-container");
      var state = active.data()[0].properties.NAME;
      console.log(state)
      g.append("text")
        .text(`${state}`)
        .attr("class", "info-title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", 75)
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      svg.transition()
        .duration(750)
        .call(zoom.translate([0, 0]).scale(1).event);

      d3.select(".info-container").remove();
      removeActiveState();
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

  obtainStateData: function(state) {
    var lookup = this.get('stateLookup');
    var state_code = lookup[state];
    var data = this.get('data');

    if (!state_code) { return "" }

    return data.filter(function(state_data) {
      return state_data.state === state_code;
    })[0];
  },

  renderData: function() {
    var data = this.get('data');
    var dataset = this.get('dataset');
    var mapAttributes = this.get('mapAttributes');
    var outputColumn = mapAttributes[dataset];

    var min = d3.min(data, function(d) {
      return d[outputColumn];
    });

    var max = d3.max(data, function(d) {
      return d[outputColumn];
    });

    var q = d3.scale.ordinal().domain([min,max]).range(["map-q0", "map-q1",
      "map-q2", "map-q3", "map-q4", "map-q5", "map-q6", "map-q7", "map-q8"])

    d3.selectAll("path")
      .attr("class", function(d) {
        if (d.properties) {
          var state_data = this.obtainStateData(d.properties.NAME);
          var percent = state_data[outputColumn];
          return `feature ${ q(percent) }`;
        }
      }.bind(this));
  }.observes('data'),

  removeStateData: function() {
    d3.select('.info-data-container').remove();
    this.appendStateData();
  }.observes('dataset'),

  appendStateData: function() {
    var g = d3.select(".info-container");
    var textGroup = g.append('g')
      .attr("class", "info-data-container");
    var width = this.get('width');
    var dataset = this.get('dataset')

    this.appendDatasetTitle(textGroup, width);

    switch (dataset) {
      case 'poverty':
        this.appendPovertyData(textGroup, width);
        break;
      case 'education':
        this.appendEducationData(textGroup, width);
        break;
      case 'marital':
        this.appendMaritalData(textGroup, width);
        break;
      case 'migration':
        this.appendMigrationData(textGroup, width);
        break;
    }
  }.observes('activeState'),

  appendDatasetTitle: function(g, width) {
    var dataset = this.get('dataset')
    var datasetName = this.get('datasetNames')[dataset]

    g.append("text")
      .text(`${datasetName} Dataset`)
      .attr("class", "info-dataset")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", 120)
  },

  appendPovertyData(g, width) {
    var state = this.get('activeState');
    var state_data = this.obtainStateData(state);
    var col1Spacing = width / 12 * 2;
    var col2Spacing = width / 12 * 7;
    var dataBoxStart = 250;
    var rowHeight = 35;

    var dataCol1 = g.append("g")
      .attr("class", "data-col-1");

    g.append("text")
      .text(`State Population: ${state_data.population}`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6)
      .attr("y", 160)

    g.append("text")
      .text(`Below Poverty: ${state_data.population_below_poverty}`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 3)
      .attr("y", 160)

    g.append("text")
      .text(`Below Poverty: ${parseFloat(state_data.percent_below_poverty, 10).toFixed(2)}%`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 5)
      .attr("y", 160)

    dataCol1.append("text")
      .text(`Males Below Poverty: ${state_data.male_below_poverty}`)
      .attr("class", "map-data-header")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart - 20)

    dataCol1.append("text")
      .text(`Males Under 18: ${state_data.male_below_poverty_5
        + state_data.male_below_poverty_under5
        + state_data.male_below_poverty_6to11
        + state_data.male_below_poverty_12to14
        + state_data.male_below_poverty_15
        + state_data.male_below_poverty_16to17}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight)

    dataCol1.append("text")
      .text(`Males 18 to 34: ${state_data.male_below_poverty_18to24
        + state_data.male_below_poverty_25to34}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 2)

    dataCol1.append("text")
      .text(`Males 35 to 54: ${state_data.male_below_poverty_35to44
        + state_data.male_below_poverty_45to54}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 3)

    dataCol1.append("text")
      .text(`Males 55 to 74: ${state_data.male_below_poverty_55to64
        + state_data.male_below_poverty_65to74}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 4)

    dataCol1.append("text")
      .text(`Males Over 75: ${state_data.male_below_poverty_over75}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 5)

    dataCol1.append("text")
      .text(`Females Below Poverty: ${state_data.female_below_poverty}`)
      .attr("class", "map-data-header")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart - 20)

    dataCol1.append("text")
      .text(`Females Under 18: ${state_data.female_below_poverty_5
        + state_data.female_below_poverty_under5
        + state_data.female_below_poverty_6to11
        + state_data.female_below_poverty_12to14
        + state_data.female_below_poverty_15
        + state_data.female_below_poverty_16to17}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight)

    dataCol1.append("text")
      .text(`Females 18 to 34: ${state_data.female_below_poverty_18to24
        + state_data.female_below_poverty_25to34}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight * 2)

    dataCol1.append("text")
      .text(`Females 35 to 54: ${state_data.female_below_poverty_35to44
        + state_data.female_below_poverty_45to54}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight * 3)

    dataCol1.append("text")
      .text(`Males 55 to 74: ${state_data.female_below_poverty_55to64
        + state_data.female_below_poverty_65to74}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight * 4)

    dataCol1.append("text")
      .text(`Females Over 75: ${state_data.female_below_poverty_over75}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight * 5)
  },

  appendEducationData(g, width) {
    var state = this.get('activeState');
    var state_data = this.obtainStateData(state);
    var col1Spacing = width / 2;
    var dataBoxStart = 260;
    var rowHeight = 30;

    var dataCol1 = g.append("g")
      .attr("class", "data-col-1");

    g.append("text")
      .text(`No Schooling Completed: ${parseFloat(state_data.no_schooling_completed_percent, 10).toFixed(2)}%`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 3)
      .attr("y", 160)

    g.append("text")
      .text(`High School Diploma or GED: ${parseFloat(state_data.high_school_diploma_or_ged_percent, 10).toFixed(2)}%`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 3)
      .attr("y", 185)

    g.append("text")
      .text(`College or Above: ${parseFloat(state_data.college_or_above_percent, 10).toFixed(2)}%`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 3)
      .attr("y", 210)

    dataCol1.append("text")
      .text(`Population: ${state_data.population}`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart)

    dataCol1.append("text")
      .text(`No Schooling: ${state_data.no_schooling_completed}`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight)

    dataCol1.append("text")
      .text(`High School Diploma: ${state_data.regular_high_school_diploma}`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 2)

    dataCol1.append("text")
      .text(`GED or Alternative: ${state_data.ged_or_alternative}`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 3)

    dataCol1.append("text")
      .text(`Bachelors Degree: ${state_data.bachelors_degree}`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 4)

    dataCol1.append("text")
      .text(`Masters Degree: ${state_data.masters_degree}`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 5)

    dataCol1.append("text")
      .text(`Professional Degree: ${state_data.professional_degree}`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 6)

    dataCol1.append("text")
      .text(`Doctorate Degree: ${state_data.doctorate_degree}`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 7)
  },

  appendMaritalData(g, width) {
    var state = this.get('activeState');
    var state_data = this.obtainStateData(state);
    var col1Spacing = width / 12 * 1.5;
    var col2Spacing = width / 12 * 6.5;
    var dataBoxStart = 250;
    var rowHeight = 35;

    var dataCol1 = g.append("g")
      .attr("class", "data-col-1");

    g.append("text")
      .text(`State Population: ${state_data.population}`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6)
      .attr("y", 160)

    g.append("text")
      .text(`Never Married: ${parseFloat(state_data.never_married_percentage, 10).toFixed(2)}%`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 3)
      .attr("y", 160)

    g.append("text")
      .text(`Ever Married: ${parseFloat(state_data.ever_married_percentage, 10).toFixed(2)}%`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 5)
      .attr("y", 160)

    dataCol1.append("text")
      .text(`Male Population: ${state_data.male_population}`)
      .attr("class", "map-data-header")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart - 20)

    dataCol1.append("text")
      .text(`Males Never Married: ${state_data.male_never_married}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight)

    dataCol1.append("text")
      .text(`Males Ever Married: ${state_data.male_ever_married}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 2)

    dataCol1.append("text")
      .text(`Males Married (previously): ${state_data.male_ever_married_and_married_last_year}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 3)

    dataCol1.append("text")
      .text(`Males Married (currently): ${state_data.male_ever_married_and_not_married_last_year}`)
      .attr("class", "map-data-point")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 4)

    dataCol1.append("text")
      .text(`Female Population: ${state_data.female_population}`)
      .attr("class", "map-data-header")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart - 20)

    dataCol1.append("text")
      .text(`Females Never Married: ${state_data.female_never_married}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight)

    dataCol1.append("text")
      .text(`Females Ever Married: ${state_data.female_ever_married}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight * 2)

    dataCol1.append("text")
      .text(`Females Married (previously): ${state_data.female_ever_married_and_married_last_year}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight * 3)

    dataCol1.append("text")
      .text(`Females Married (currently): ${state_data.female_ever_married_and_not_married_last_year}`)
      .attr("class", "map-data-point")
      .attr("x", col2Spacing)
      .attr("y", dataBoxStart + rowHeight * 4)
  },

  appendMigrationData(g, width) {
    var state = this.get('activeState');
    var state_data = this.obtainStateData(state);
    var col1Spacing = width / 2;
    var dataBoxStart = 230;
    var rowHeight = 35;

    var dataCol1 = g.append("g")
      .attr("class", "data-col-1");

    g.append("text")
      .text(`Median Age: ${state_data.median_age}`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", width / 6 * 3)
      .attr("y", 160)

    dataCol1.append("text")
      .text(`Housing within the last year:`)
      .attr("class", "map-data-header")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart)

    dataCol1.append("text")
      .text(`Same House: ${state_data.same_house_1_year_ago}%`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight)

    dataCol1.append("text")
      .text(`Moved (same county): ${state_data.moved_within_the_same_county}%`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 2)

    dataCol1.append("text")
      .text(`Moved (same state): ${state_data.moved_from_different_county_within_same_state}%`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 3)

    dataCol1.append("text")
      .text(`Moved (diff. state): ${state_data.moved_from_different_state}%`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 4)

    dataCol1.append("text")
      .text(`Moved (from abroad): ${state_data.moved_from_abroad}%`)
      .attr("class", "map-data-point")
      .attr("text-anchor", "middle")
      .attr("x", col1Spacing)
      .attr("y", dataBoxStart + rowHeight * 5)
  }
});
