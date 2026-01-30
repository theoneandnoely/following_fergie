// Set dimensions and margins for chart
const margin = { top: 40, right: 40, bottom: 50, left: 50 };
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;

// Set up the x and y scales
const x = d3.scaleTime()
    .range([0, width]);
const y = d3.scaleLinear()
    .range([height, 0]);

// Create the SVG element and append it to the chart container
const svg = d3.select("#total-cum-gd-line")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
;

// Create tooltip div
const tooltip = d3.select("#total-cum-gd-line")
    .append("div")
    .attr("class", "tooltip")
;

// Create Map for Competition Logos
const logoMap = new Map();
logoMap
    .set('Premier League','images/Premier_League.png')
    .set('Champions League','images/Champions_League.png')
    .set('Europa League','images/Europa_League.png')
    .set('FA Cup', 'images/FA_Cup.png')
    .set('League Cup','images/League_Cup.png')
    .set('Community Shield','images/Community_Shield.png')
    .set('UEFA Super Cup','images/UEFA_Super_Cup.png')
;

// Create Colour Map for Managers
const colourMap = new Map();
colourMap
    .set('David Moyes','#d40b29')
    .set('Ryan Giggs','#17334d')
    .set('Louis van Gaal','#ffe697')
    .set('José Mourinho','#527d5a')
    .set('Ole Gunnar Solskjaer','#c3102b')
    .set('Ralf Rangnick','#ffc5ce')
    .set('Michael Carrick','#082036')
    .set('Erik ten Hag','#f36c21')
    .set('Ruben Amorim','#9bc693')
    .set('Ruud van Nistelrooy','#646464')
    .set('Darren Fletcher','#eed99b')
;

// Load the data from the CSV
d3.csv("data/united_competitive_results_post_ferguson.csv").then(function (data) {
    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.logo = logoMap.get(d.competition);
        d.gf = +d.gf;
        d.ga = +d.ga;
        d.gd = +d.gd;
        d.manager_gd = +d.manager_gd
        d.cum_gd = +d.cum_gd
    });

    // Group data by manager_type
    const types = d3.group(
        data,
        (d) => d.manager_type
    );

    // Group each manager type by manager
    const permanents = d3.group(
        types.get("Permanent"),
        (d) => d.manager
    );
    const interims = d3.group(
        types.get("Interim"),
        (d) => d.manager
    );
    const caretakers = d3.group(
        types.get("Caretaker"),
        (d) => d.manager
    );

    // Define the x and y domains
    x.domain(d3.extent(data, d => d.date));
    y.domain([d3.min(data, d => d.cum_gd), d3.max(data, d => d.cum_gd)]);

    // Add the x and y axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(d3.timeMonth.every(6))
            .tickFormat(d3.timeFormat("%b %Y"))
        )
        .call(g => g.select(".domain").remove())
    ;
    svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
    ;

    // Add gridlines
    svg.append("g")
        .attr("class","gridlines")
        .attr("id","vertical-grid")
        .selectAll("xGrid")
            .data(x.ticks())
            .join("line")
                .attr("x1", d => x(d))
                .attr("x2", d => x(d))
                .attr("y1", 0)
                .attr("y2", height)
    ;
    svg.append("g")
        .attr("class","gridlines")
        .attr("id","horizontal-grid")
        .selectAll("yGrid")
            .data(y.ticks().slice(0))
            .join("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", d => y(d))
                .attr("y2", d => y(d))
    ;

    // Create the line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.cum_gd))
    ;

    // Shade non-playing timeframes
    const timeframes = [
        {start: parseDate('2014-05-12'),end: parseDate('2014-08-15'),},
        {start: parseDate('2015-05-25'),end: parseDate('2015-08-07'),},
        {start: parseDate('2016-05-22'),end: parseDate('2016-08-06'),},
        {start: parseDate('2017-05-25'),end: parseDate('2017-08-07'),},
        {start: parseDate('2018-05-20'),end: parseDate('2018-08-09'),},
        {start: parseDate('2019-05-13'),end: parseDate('2019-08-10'),},
        {start: parseDate('2020-07-27'), end: parseDate('2020-08-04'),},
        {start: parseDate('2021-05-27'),end: parseDate('2021-08-13'),},
        {start: parseDate('2022-05-23'),end: parseDate('2022-08-06'),},
        {start: parseDate('2023-06-04'),end: parseDate('2023-08-13'),},
        {start: parseDate('2024-05-26'),end: parseDate('2024-08-09'),},
        {start: parseDate('2025-05-26'), end: parseDate('2025-08-16'),},
        {start: parseDate('2020-03-13'),end: parseDate('2020-06-18'),label: 'COVID-19 Shutdown',},
    ]
    const g_timeframes = svg.append("g")
        .attr("id","non-playing-periods")
        .selectAll("g.timeframe")
            .data(timeframes)
            .join("g")
                .attr("class","timeframe")
    ;
    g_timeframes.append("rect")
        .attr("x", d =>  x(d.start))
        .attr("y", 0)
        .attr("width", d => x(d.end) - x(d.start))
        .attr("height", height)
    ;
    g_timeframes.filter(d => Object.hasOwn(d, 'label')) // Only add text if a label exists
        .append("text")
            .attr("x", d => x(d.start) + (x(d.end) - x(d.start))/2)
            .attr("y",10)
            .text(d => d.label)
    ;

    // Add the line path to the SVG element
    const g_lines = svg.append('g').attr('id','lines');
    g_lines.append('g')
        .attr('id','permanent_manager_paths')
        .selectAll('.permanent_manager_path')
            .data(permanents)
            .join('path')
                .attr('d', (d) => line(d[1]))
                .attr('stroke',(d) => colourMap.get(d[0]))
    ;
    g_lines.append('g')
        .attr('id','interim_manager_paths')
        .selectAll('.interim_manager_path')
            .data(interims)
            .join('path')
                .attr('d', (d) => line(d[1]))
                .attr('stroke',(d) => colourMap.get(d[0]))
    ;
    g_lines.append('g')
        .attr('id','caretaker_manager_paths')
        .selectAll('.caretaker_manager_path')
            .data(caretakers)
            .join('path')
                .attr('d', (d) => line(d[1]))
                .attr('stroke',(d) => colourMap.get(d[0]))
    ;

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
        .attr("class", "listening_rect")
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0)
    ;

    // Create generic entered, moved, and left functions for handling tooltip creation, update, and removal
    function moved(e) {
        //d3.pointer doesn't seem to return the correct value for touchmove so manually pulled the same value as in the d3.pointer source (https://github.com/d3/d3-selection/blob/main/src/pointer.js)
        const [xCoord] = e.type === "touchmove" ? [e.touches[0].clientX - this.getBoundingClientRect().left - this.clientLeft, e.touches[0].clientY] : d3.pointer(e, this); 
        const bisectDate = d3.bisector(d => d.date).left;
        const x0 = x.invert(xCoord);
        const i = bisectDate(data, x0, 1);
        const d0 = data[i-1];
        const d1 = data[i];
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        const xPos = x(d.date);
        const yPos = y(d.cum_gd);

        circle
            .attr("cx", xPos)
            .attr("cy", yPos)
        ;

        circle
            .transition()
            .duration(50)
            .attr("r",5)
        ;

        const options = {
            year:"numeric",
            month:"short",
            day:"numeric"
        };

        tooltip
            .style("display", "block")
            .style("left", `${xPos < (width/4) ? (xPos + margin.left + 10) : (xPos - margin.left - 80)}px`)
            .style("right", `${xPos < (width/4) ? width - margin.right - 120 - xPos : (width + margin.right - 20) - xPos}px`)
            .style("top", `${yPos < (height/2) ? yPos + margin.top + 10 : yPos - margin.top - 10}px`)
            .style("border",`1px solid ${colourMap.get(d.manager)}`)
            .html(
                `<div class="tooltip-container" id="match-container">
                    <div class="match-details">
                        <div class="match-date">${d.date.toLocaleDateString('en-IE', options)}</div>
                        <div class="opponent" ><strong>${d.opponent}</strong> (${d.h_a === 'h' ? 'H' : 'A'})</div>
                        <div class="tooltip-container" id="score-container">
                            <div class="score">${d.h_a === 'h' ? `<strong>${d.gf}</strong>` : d.ga} - ${d.h_a === 'h' ? d.ga : `<strong>${d.gf}</strong>` }</div>
                            <div class="match-gd">${d.gd > 0 ? `(+${d.gd})` : `(${d.gd})`}</div>
                        </div>
                    </div>
                    <div class="logo">
                        <img src=${d.logo} width="25" height="30">
                    </div>
                </div>
                <hr style="background-color:${colourMap.get(d.manager)}">
                <div class="tooltip-container" id="manager-container">
                    <div class="manager_name"><strong>${d.manager}</strong></div>
                    <div class="manager-gd">${d.manager_gd > 0 ? `+${d.manager_gd}` : d.manager_gd}</div>
                </div>
                <div class="tooltip-container" id="post-fergie-gd-container">
                    <div><strong>GD post Fergie:</strong></div>
                    <div class="cum-gd">${d.cum_gd > 0 ? `+${d.cum_gd}` : d.cum_gd}</div>
                </div>`
            )
        ;
    }

    function left() {
        circle.transition()
            .duration(50)
            .attr("r",0)
        ;
        tooltip.style("display","none");
    }

    // Add functions to listeninrect for mousemove, touchmove, mouseleave, and touchend
    listening_rect
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("mousemove", moved)
        .on("touchend", left)
        .on("mouseleave", left)
    ;

    // Add Y-axis and Chart titles
    const g_titles = svg.append('g')
        .attr('id','titles')
    ;
    g_titles.append("text")
        .attr('class','chart-text axis-title y-axis')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .text("Cumulative Goal Difference")
    ;
    svg.append("text")
        .attr("class", "chart-text chart-title")
        .attr("x", -margin.left/2)
        .attr("y", -10)
        .text("Cumulative Goal Difference for Manchester United F.C. post Alex Ferguson")
    ;
})