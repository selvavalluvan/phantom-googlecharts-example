exports.generateChart = function (jsonData, callback) {
    var page = require('webpage').create();
    //create a viewport size
    var width = jsonData.options.width || 1024;
    var height = jsonData.options.height || 768;
    page.viewportSize = {width: width, height: height};

    //create and html document with jquery and the Google JSAPI and Visualization scripts all loaded
    page.content = '<html><head><title></title><style>font-family: "Arial", sans-serif;</style></head><body><div id="chart">Chart did not generate</div></body></html>';

    page.onConsoleMessage = function (msg) {
        console.log('CONSOLE: ' + msg);
    };

    function onPageReady() {

        var info = page.evaluate(function (jsonData) {
            var chartData = new google.visualization.DataTable();

            switch (jsonData.type) {
                case 'BarChart':
                case 'LineChart':
                case 'PieChart':
                case 'ComboChart':
                    if (jsonData.data) {
                        chartData = google.visualization.arrayToDataTable(jsonData.data);
                    }
                    break;
            }

            var options = jsonData.options;

            // Instantiate and draw our chart, passing in some options.
            var chartDiv = document.getElementById('chart');
            var chart = new google.visualization[jsonData.type](chartDiv);
            chart.draw(chartData, options);

            var serializer = new XMLSerializer();
            return serializer.serializeToString(chartDiv);
        }, jsonData);

        if (typeof callback === 'function') {
            convertToPng(page, info, function (image) {
                callback(image);
            });
        }

    }

    //once the page is loaded, run the generation process
    page.onLoadFinished = function () {
        console.log('=== INJECT JS ===');
        if (page.injectJs('./vendors/google-chart-loader.js')) {
            page.evaluate(function () {
                google.charts.load('current', {'packages': ['corechart']});
                google.charts.setOnLoadCallback(function () {
                    document.isGoogleChartsReady = true;
                });
            });
            function checkReadyState() {
                setTimeout(function () {
                    var readyState = page.evaluate(function () {
                        return document.readyState;
                    });
                    var isGoogleChartsReady = page.evaluate(function () {
                        return document.isGoogleChartsReady;
                    });
                    if (('complete' === readyState) && isGoogleChartsReady) {
                        onPageReady();
                    } else {
                        setTimeout(function () {
                            checkReadyState();
                        },500);
                    }
                });
            }

            checkReadyState();
        }
    };
};

function convertToPng(page, data, callback) {
    page.content = data;
    page.onLoadFinished = function () {
        function checkReadyState() {
            setTimeout(function () {
                var readyState = page.evaluate(function () {
                    return document.readyState;
                });
                if ('complete' === readyState) {
                    callback(page.renderBase64('PNG'));
                } else {
                    checkReadyState();
                }
            });
        }

        checkReadyState();
    };
}

//TODO: IMPORTANT. THERE IS A TIMEOUT IN THIS PAGE FOR ONE SECOND. It is to remove race condition of page load and page evaluate. That is not a proper way of doing that, since the Javascript in google js api could take more than one second. Refactor later.
