import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement: function() {
    this.generateDonut();
  },

  generateDonut: function() {
    var duration   = 500;
    var transition = 200;
    var sentimentScore = this.get('sentimentScore');
    var percent    = (sentimentScore + 1) * 50;

    drawDonutChart('#donut', percent, 100, 100, ".35em");

    function drawDonutChart(element, percent, width, height, text_y) {
      width = typeof width !== 'undefined' ? width : 290;
      height = typeof height !== 'undefined' ? height : 290;
      text_y = typeof text_y !== 'undefined' ? text_y : "-.10em";

      var dataset = {
        lower: calcPercent(0),
        upper: calcPercent(percent)
      };

      var radius = Math.min(width, height) / 2;
      var pie = d3.layout.pie().sort(null);
      var format = d3.format(".0%");

      var arc = d3.svg.arc()
        .innerRadius(radius - 20)
        .outerRadius(radius);

      var svg = d3.select(element).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var path = svg.selectAll("path")
        .data(pie(dataset.lower))
        .enter().append("path")
        .attr("class", function(d, i) { return "color" + i  })
        .attr("d", arc)
        .each(function(d) { this._current = d;  }); // store the initial values

      var text = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", text_y);

      if (typeof(percent) === "string") {
        text.text(percent);
      } else {
        var progress = 0;
        var timeout = setTimeout(function () {
          clearTimeout(timeout);
          path = path.data(pie(dataset.upper)); // update the data
          path.transition().duration(duration).attrTween("d", function (a) {
            var i  = d3.interpolate(this._current, a);
            var i2 = d3.interpolate(progress, percent);
            this._current = i(0);
            return function(t) {
              text.text( format(i2(t) / 100)  );
              return arc(i(t));
            };
          });
        }, 200);
      }
    };

    function calcPercent(percent) {
      return [percent, 100-percent];
    };
  }.observes('dataset')
});
