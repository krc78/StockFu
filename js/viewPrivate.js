priceOption = 1;
makeNew = 0;

errorData = 0;

var xScale;
var yScale;
var height = 400;
var width = 900;
var margins = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 50
};
var demo = d3.select("#newChart");

demo.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margins.top / 2))
    .attr("text-anchor", "middle")
    .attr("id", "charTooltip")
    .style("font-size", "16px")
    .style('fill', "black")
    .style("text-decoration", "underline")
    .text("chartName");

// Obtains chart data from database to reconstruct scales
function getChartData(callback) {
    var chartID = location.search.split('chartID=')[1];
    var parameters = JSON.stringify({
        chartID: chartID
    });
    $.ajax({
            type: 'POST',
            url: 'query.php',
            data: {
                'param': parameters
            },
            datatype: 'json',
        })
        .done(function(data) {
            // Obtains record array from database query
            data = JSON.parse(data);
            minDate = new Date(data[0]);
            maxDate = new Date(data[1]);
            startDate = "start_date=" + data[6];
            endDate = "&end_date=" + data[7];
            name = data[5];
            chartName = data[8];
            console.log(name);
            stock1Name = reversedMap.get(name);

            APICall = 'https://www.quandl.com/api/v3/datasets/WIKI/' + stock1Name + '.json?' + startDate + endDate + '&api_key=KDzspapgf7Mv2zbUmTgd';

            priceYMax = data[2];

            // Obtains dates array and date map from JSON in database
            dates = JSON.parse(data[3]);
            dateMap = new Map(JSON.parse(data[4]));

            // Creates scales identical to those used in makeNew.js
            xScale = d3.time.scale().range([margins.left, width - margins.right]).domain([minDate, maxDate]);
            yScale = d3.scale.linear().range([height - margins.top, margins.bottom]).domain([0, priceYMax]);
            callback(xScale, yScale);
        });
}

// Retrieves all relevant stock information for the closest date
// Date arrays are sorted in descending order,
// so beforedates[0] is the closest date that it still before date_formatted

/*
d3.select("#charTooltip")
.attr("class", "thisText")
.attr("x", 350)
.attr("y", 15)
.attr("fill", "black").style("text-anchor", "middle")
// Sets text to tooltip with stock information from given date
.text(date[1] + " " + date[2] + " " + date[3] +
    " Open: " + dateData[1] +
    " High: " + dateData[2] + " Low: " + dateData[3] +
    " Close: " + dateData[4] +
    " Volume: " + dateData[5])
.style("font-weight","bold");
*/



$(function() {
    // Sets global variables, as well as flag to indicate Ajax call has completed
    returnCompanyMap(function(map, reversed, names) {
        companyMap = map;
        reversedMap = reversed;
        companyNames = names;
    });

    // Adds datepicker calendar feature to the following input fields

    getChartData(function(xScale, yScale) {
        d3.select("#newChart")
            .on("mouseover", function() {
                // Allows tooltip to display in chart
                d3.select("#charTooltip").attr("display", null);
            })
            .on("mouseout", function() {
                // Causes tooltip text to dissapear upon removing mouse from line chart
                d3.select("#charTooltip").attr("display", "none");
            })
            .on("mousemove", function() {
                // Updates position and text in tooltip with correct information based on where mouse is on chart
                var date = xScale.invert(d3.event.pageX - margins.left - margins.right).toString().split(" ");
                var date_formatted = new Date(xScale.invert(d3.event.pageX).toString());

                // Creates an array of all dates before the date on the x scale
                var beforedates = dates.filter(function(d) {
                    return d - date_formatted < 0;
                });
                var dateData = dateMap.get(beforedates[0]);
                $("#date").html(date[1] + " " + date[2] + " " + date[3]);
                $("#open").html(dateData[1].toFixed(2));
                $("#high").html(dateData[2].toFixed(2));
                $("#low").html(dateData[3].toFixed(2));
                $("#close").html(dateData[4].toFixed(2));
                $("#volume").html(dateData[5]);

                // Retrieves all relevant stock information for the closest date
                // Date arrays are sorted in descending order,
                // so beforedates[0] is the closest date that it still before date_formatted
                var dateData = dateMap.get(beforedates[0]);
                // d3.select("#charTooltip")
                //     .attr("class", "thisText")
                //     .attr("x", 350)
                //     .attr("y", 15)
                //     .attr("fill", "black").style("text-anchor", "middle")
                //     // Sets text to tooltip with stock information from given date
                //     .text(date[1] + " " + date[2] + " " + date[3] +
                //         " Open: " + dateData[1] +
                //         " High: " + dateData[2] + " Low: " + dateData[3] +
                //         " Close: " + dateData[4] +
                //         " Volume: " + dateData[5])
                //     .style("font-weight", "bold");
            });
    });

    $('#edit').click(function() {
        $('#editPane').toggle("fast");
    });
    $('#add').click(function() {
        $('#secondOne').toggle("fast");
    });

    $('#delete').click(function() {
        if (confirm("Are you sure that you want to delete this chart?")) {
            var chartID = location.search.split('chartID=')[1];
            console.log(chartID);
            var params = JSON.stringify({
                chartID: chartID
            });

            // Sends request to server to remove chart with given chart ID
            $.ajax({
                    type: 'POST',
                    url: 'removeChart.php',
                    data: {
                        'param': params
                    },
                    datatype: 'json'
                })
                .done(function(data) {
                    console.log("Succeeded");
                    console.log(data);
                    window.location.replace("home.php");
                })
                .fail(function(data) {
                    console.log("Failed");
                    console.log(data);
                });
        }
    });

    $('#save').click(function() {
        publicChart = (document.getElementById("publicChoice").checked) ? 1 : 0;
        if (!errorData) {
            var chartID = location.search.split('chartID=')[1];
            
            var svgChildren = document.getElementById("newChart").outerHTML;
            console.log(svgChildren);
            var params = JSON.stringify({
                chartID: chartID,
                startDate: startDate.substring(11),
                endDate: endDate.substring(10),
                svg: svgChildren,
                minDate: minDate.toString(),
                maxDate: maxDate.toString(),
                dates: JSON.stringify(dates),
                dateMap: JSON.stringify(Array.from(dateMap.entries())),
                publicBool: publicChart,
                priceYMax: priceYMax,
                chartName: chartName
            })
            $.ajax({
                    type: 'POST',
                    url: 'save.php',
                    data: {
                        'param': params
                    }
                })
                .done(function(data) {
                  console.log("Succeeded");
                  console.log(data);
                  $("#save-confirmation").text("Changes successfully saved!");
                })
                .fail(function(data) {
                  console.log("Failed");
                  console.log(data);
                  $("#save-confirmation").text("Changes were not successfully saved.");
                });
        }


    });


});
