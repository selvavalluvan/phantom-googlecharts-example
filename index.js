var GC = require('./googlecharts');
var chartData = {};
chartData.options = {
    title: 'Population of Largest U.S. Cities',
    chartArea: {width: '50%'},
    hAxis: {
        title: 'Total Population',
        minValue: 0
    },
    vAxis: {
        title: 'City'
    }
};
chartData.options.width = 510;
chartData.options.height = 300;
chartData.options.chartArea = {left: '15%'};

chartData.data = [
    ['City', '2010 Population',],
    ['New York City, NY', 8175000],
    ['Los Angeles, CA', 3792000],
    ['Chicago, IL', 2695000],
    ['Houston, TX', 2099000],
    ['Philadelphia, PA', 1526000]
];
chartData.type = 'BarChart';

GC.generateChart(chartData, function (svg) {
    console.log("data:image/png;base64,"+svg);
});

