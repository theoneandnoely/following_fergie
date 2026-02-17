export const lineChart = () => {
    let width;
    let height;
    let data;
    let xValue;
    let yValue;
    let extents;
    let colourMap;
    let timeframes;


    const my = (selection) => {
        const x = (
            xValue === 'date'
            ? d3.scaleTime()
                .range([0,width])
                .domain(extents.x.date)
            : d3.scaleLinear()
                .range([0, width])
                .domain(extents.x.games)
        );
        const y = d3.scaleLinear()
            .range([height,0])
        ;

        // Set x and y domains based on the x/y value selected
        // x.domain(xValue === 'date' ? d3.extent(data, d => d.date) : [0, d3.max(data, d => d.games_in_charge)]);
        y.domain(
            yValue === 'cumulative_gd'
            ? (xValue === 'date' ? extents.y.cumulative.gd : extents.y.manager.gd)
            : (
                yValue === 'goals_scored'
                ? (xValue === 'date' ? extents.y.cumulative.gf : extents.y.manager.gf)
                : (xValue === 'date' ? extents.y.cumulative.ga : extents.y.manager.ga)
            )
        );
        

        // Add x and y axes
        if (xValue === 'date') {
            selection
                .selectAll('g.xAxis')
                .data([null])
                .join('g')
                    .attr('class','xAxis')
                    .attr('transform',`translate(0,${height})`)
                    .call(d3.axisBottom(x)
                        .ticks(d3.timeMonth.every(6))
                        .tickFormat(d3.timeFormat('%b %Y'))
                    )
                    .call(g => g.select('.domain').remove())
            ;
        } else {
            selection
                .selectAll('g.xAxis')
                .data([null])
                .join('g')
                    .attr('class','xAxis')
                    .attr('transform',`translate(0,${height})`)
                    .call(d3.axisBottom(x))
                    .call(g => g.select('.domain').remove())
            ;
        }

        selection
            .selectAll('g.yAxis')
            .data([null])
            .join('g')
                .attr('class','yAxis')
                .call(d3.axisLeft(y))
                .call(g => g.select('.domain').remove())
        ;
        

        // Add gridlines
        const xGrid = selection
            .append('g')
            .attr('class','gridlines')
            .attr('id','vertical-grid')
        ;
        xGrid
            .selectAll('xGrid')
            .data(x.ticks())
            .join('line')
                .attr('x1', d => x(d))
                .attr('x2', d => x(d))
                .attr('y1', 0)
                .attr('y2', height)
        ;
        const yGrid = selection
            .append('g')
            .attr('class','gridlines')
            .attr('id','horizontal-grid')
        ;
        yGrid
            .selectAll('yGrid')
            .data(y.ticks())
            .join('line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', d => y(d))
                .attr('y2', d => y(d))
        ;

        // Line Generator needs to account for the selecting the right x / y data
        const line = d3.line()
            .x(xValue === 'date' ? (d) => x(d.date) : (d) => x(d.games_in_charge))
            // For each yValue option (if neither GD or GF assume GA), check if xValue is date and set as cumulative version, otherwise manager version
            .y(
                yValue === 'cumulative_gd' 
                ? (
                    xValue === 'date' 
                    ? (d) => y(d.cum_gd) 
                    : (d) => y(d.manager_gd)
                ) : (
                    yValue === 'goals_scored' 
                    ? (
                        xValue === 'date' 
                        ? (d) => y(d.cum_gf) 
                        : (d) => y(d.manager_gf)
                    ) : (
                        xValue === 'date'
                        ? (d) => y(d.cum_ga)
                        : (d) => y(d.manager_ga)
                    )
                )
            )
        ;

        const t = d3.transition().duration(250);

        selection.selectAll('path')
                .data(data)
                .join(
                    (enter) => enter
                        .append('path')
                            .attr('d',(d) => line(d[1]))
                            .attr('stroke', (d) => colourMap.get(d[0]))
                            .attr('fill','none')
                        .call(
                            (enter) => enter
                                .transition(t)
                                .attr('d', (d) => line(d[1]))
                        ),
                    (update) => update
                        .call(
                            (update) => update
                                .transition(t)
                                .attr('d', (d) => line(d[1]))
                        ),
                    (exit) => exit.remove()
                )
        ;
        // const interim_paths = g_lines.append('g')
        //     .attr('id','interim_manager_paths')
        // ;
        // interim_paths.selectAll('path')
        //         .data(interims)
        //         .join(
        //             (enter) => enter
        //                 .append('path')
        //                     .attr('d','')
        //                     .attr('stroke', (d) => colourMap.get(d[0]))
        //                 .call(
        //                     (enter) => enter
        //                         .transition(t)
        //                         .attr('d', (d) => line(d[1]))
        //                 ),
        //             (update) => update
        //                 .call(
        //                     (update) => update
        //                         .transition(t)
        //                         .attr('d', (d) => line(d[1]))
        //                 ),
        //             (exit) => exit.remove()
        //         )
        // ;
        // const caretaker_paths = g_lines.append('g')
        //     .attr('id','caretaker_manager_paths')
        // ;
        // caretaker_paths.selectAll('path')
        //         .data(caretakers)
        //         .join(
        //             (enter) => enter
        //                 .append('path')
        //                     .attr('d','')
        //                     .attr('stroke', (d) => colourMap.get(d[0]))
        //                 .call(
        //                     (enter) => enter
        //                         .transition(t)
        //                         .attr('d', (d) => line(d[1]))
        //                 ),
        //             (update) => update
        //                 .call(
        //                     (update) => update
        //                         .transition(t)
        //                         .attr('d', (d) => line(d[1]))
        //                 ),
        //             (exit) => exit.remove()
        //         )
        // ;
    };

    my.width = function (_) {
        return arguments.length ? ((width = _),my) : width;
    };

    my.height = function (_) {
        return arguments.length ? ((height = _),my) : height;
    };

    my.data = function (_) {
        return arguments.length ? ((data = _),my) : data;
    };

    my.xValue = function (_) {
        return arguments.length ? ((xValue = _),my) : xValue;
    };

    my.extents = function (_) {
        return arguments.length ? ((extents = _),my) : extents;
    };

    my.yValue = function (_) {
        return arguments.length ? ((yValue = _), my) : yValue;
    };

    my.colourMap = function (_) {
        return arguments.length ? ((colourMap = _), my) : colourMap;
    };

    my.timeframes = function (_) {
        return arguments.length ? ((timeframes = _), my) : timeframes;
    }

    return my;
}