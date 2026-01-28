// Set dimensions and margins for chart
const margin = { top: 40, right: 40, bottom: 50, left: 50 };
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Set up the x and y scales
const x = d3.scaleTime()
    .range([0, width]);
const y = d3.scaleLinear()
    .range([height, 0]);

// Create the SVG element and append it to the chart container
const svg = d3.select("#chart-container")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
;

// Create tooltip div
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
;

// Create Map for Competition Logos
const logoMap = new Map();
logoMap.set('Premier League','images/Premier_League.png');
logoMap.set('Champions League','images/Champions_League.png');
logoMap.set('Europa League','images/Europa_League.png');
logoMap.set('FA Cup', 'images/FA_Cup.png');
logoMap.set('League Cup','images/League_Cup.png');
logoMap.set('Community Shield','images/Community_Shield.png');
logoMap.set('UEFA Super Cup','images/UEFA_Super_Cup.png');

// Load the data from the CSV
d3.csv("data/united_competitive_results_post_ferguson.csv").then(function (data) {
    const parseDate = d3.timeParse("%Y-%m-%d");
    let accumulator = 0;
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.logo = logoMap.get(d.competition);
        d.gf = +d.gf;
        d.ga = +d.ga;
        d.gd = +d.gd;
        d.cum_gd = accumulator +d.gd
        accumulator = accumulator + +d.gd
    });

// Define the x and y domains
x.domain(d3.extent(data, d => d.date));
y.domain([d3.min(data, d => d.cum_gd), d3.max(data, d => d.cum_gd)]);

// Add the x-axis
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(6))
        .tickFormat(d3.timeFormat("%b %Y"))
    )
    .call(g => g.select(".domain").remove())
    .selectAll(".tick line")
        .style("stroke-opacity", 0.1)
        .style("stroke-width", 0.5)
;

// Add the y-axis
svg.append("g")
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .selectAll(".tick line")
        .style("stroke-opacity", 0.1)
        .style("stroke-width", 0.5)
;

// Set axis text colour for both axes
svg.selectAll(".tick text").attr("fill", "#777");

// Add vertical gridlines
svg.selectAll("xGrid")
    .data(x.ticks().slice(0))
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#eee")
    .attr("stroke-width", 0.5)
;

// Add horizontal gridlines
svg.selectAll("yGrid")
    .data(y.ticks().slice(0))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#eee")
    .attr("stroke-width", 0.5)
;

// Create the line generator
const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.cum_gd));

// Shade non-playing timeframes
const timeframes = [
    {
        start: parseDate('2014-05-12'),
        end: parseDate('2014-08-15'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2015-05-25'),
        end: parseDate('2015-08-07'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2016-05-22'),
        end: parseDate('2016-08-06'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2017-05-25'),
        end: parseDate('2017-08-07'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2018-05-20'),
        end: parseDate('2018-08-09'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2019-05-13'),
        end: parseDate('2019-08-10'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2020-07-27'),
        end: parseDate('2020-08-04'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2021-05-27'),
        end: parseDate('2021-08-13'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2022-05-23'),
        end: parseDate('2022-08-06'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2023-06-04'),
        end: parseDate('2023-08-13'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2024-05-26'),
        end: parseDate('2024-08-09'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2025-05-26'),
        end: parseDate('2025-08-16'),
        label: '',
        colour: '#eee'
    },
    {
        start: parseDate('2020-03-13'),
        end: parseDate('2020-06-18'),
        label: 'COVID-19 Shutdown',
        colour: '#eee'
    },
]

const g_timeframes = svg
    .selectAll("g.timeframe")
    .data(timeframes).enter()
    .append("g").attr("class","timeframe");

g_timeframes.append("rect")
    .attr("x", d =>  x(d.start))
    .attr("y", 0)
    .attr("width", d => x(d.end) - x(d.start))
    .attr("height", height)
    .attr("fill", d => d.colour)
    .style("fill-opacity",1);

g_timeframes.append("text")
    .attr("x", d => x(d.start) + (x(d.end) - x(d.start))/2)
    .attr("y",10)
    .attr("text-anchor", "middle")
    .style("font-size", "0.55em")
    .style("font-family", "sans-serif")
    .text(d => d.label);

// Add the line path to the SVG element
svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#c3102b")
    .attr("stroke-width", 1)
    .attr("d", line);

// Add circle element for tooltip
const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "#c3102b")
    .style("stroke", "white")
    .attr("opacity", 0.7)
    .style("pointer-events", "none")
;

// Create listening rectangle
const listening_rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("opacity", 0)
;

// Create mouse move function
listening_rect.on("mousemove", function(event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.date).left;
    const x0 = x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    const xPos = x(d.date);
    const yPos = y(d.cum_gd);

    circle
        .attr("cx", xPos)
        .attr("cy",yPos)
    ;

    // Add transition to circle radius to show circle on selected point
    circle
        .transition()
        .duration(50)
        .attr("r", 5)
    ;

    // Add tooltip
    tooltip
        .style("display", "block")
        .style("left", `${xPos + margin.left + 10}px`)
        .style("top", `${yPos + margin.top + 10}px`)
        .html(`<div class="match-container" style="display:flex; justify-content:space-between; gap:2px"><div class="match-details" style="text-align:left">${d.opponent} (${d.h_a === 'h' ? 'H' : 'A'})<br>${d.h_a === 'h' ? `<strong>${d.gf}</strong>` : d.ga} - ${d.h_a === 'h' ? d.ga : `<strong>${d.gf}</strong>` }</div><div class="logo"><img src=${d.logo} width="25" height="30"></div></div><strong>Date:</strong> ${d.date.toLocaleDateString()}<br><strong>Cumulative GD:</strong> ${d.cum_gd > 0 ? `+${d.cum_gd}` : d.cum_gd}`)
    ;
});


// Add Y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "1em")
    .style("fill", "#777")
    .text("Cumulative Goal Difference")
;

// Add Chart Title
svg.append("text")
    .attr("class", "chart-title")
    .attr("x", -margin.left/2)
    .attr("y", -10)
    .style("font-family", "sans-serif")
    .style("font-size", "1.5em")
    .style("fill", "#777")
    .text("Cumulative Goal Difference for Manchester United F.C. post Alex Ferguson")
;
})