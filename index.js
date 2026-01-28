// Set dimensions and margins for chart
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 1400 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

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
        .attr("transform", `translate(${margin.left},${margin.top})`);


// Load the data from the CSV

d3.csv("united_competitive_results_post_ferguson.csv").then(function (data) {
    const parseDate = d3.timeParse("%Y-%m-%d");
    let accumulator = 0;
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.gd = +d.gd;
        d.cum_gd = accumulator +d.gd
        accumulator = accumulator + +d.gd
    });

    console.log(data)


// Define the x and y domains
x.domain(d3.extent(data, d => d.date));
y.domain([d3.min(data, d => d.cum_gd), d3.max(data, d => d.cum_gd)]);

// Add the x-axis
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(6))
        .tickFormat(d3.timeFormat("%b %Y"))
    );

// Add the y-axis
svg.append("g")
    .call(d3.axisLeft(y));

// Create the line generator
const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.cum_gd));

// Add the line path to the SVG element
svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1)
    .attr("d", line);
})