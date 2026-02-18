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
                .domain([0,extents.x.games[1]])
        );
        const y = d3.scaleLinear()
            .range([height,0])
        ;

        // Set x and y domains based on the x/y value selected
        y.domain(
            yValue === 'cumulative_gd'
            ? (xValue === 'date' ? [d3.min([extents.y.cumulative.gd[0],0]),extents.y.cumulative.gd[1]] : [d3.min([extents.y.manager.gd[0],0]),extents.y.manager.gd[1]])
            : (
                yValue === 'goals_scored'
                ? (xValue === 'date' ? [d3.min([extents.y.cumulative.gf[0],0]),extents.y.cumulative.gf[1]] : [d3.min([extents.y.manager.gf[0],0]),extents.y.manager.gf[1]])
                : (xValue === 'date' ? [d3.min([extents.y.cumulative.ga[0],0]),extents.y.cumulative.ga[1]] : [d3.min([extents.y.manager.ga[0],0]),extents.y.manager.ga[1]])
            )
        );
        
        const axes_container = selection
            .selectAll('.axis-container')
            .data([null])
            .join(
                (enter) => enter
                    .append('g')
                        .attr('class','axis-container')
            )

        // Add x and y axes
        if (xValue === 'date') {
            axes_container
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
            axes_container
                .selectAll('g.xAxis')
                .data([null])
                .join('g')
                    .attr('class','xAxis')
                    .attr('transform',`translate(0,${height})`)
                    .call(d3.axisBottom(x))
                    .call(g => g.select('.domain').remove())
            ;
        }

        axes_container
            .selectAll('g.yAxis')
            .data([null])
            .join('g')
                .attr('class','yAxis')
                .call(d3.axisLeft(y))
                .call(g => g.select('.domain').remove())
        ;
        
        
        const t = d3.transition().duration(250);

        // Add gridlines
        const xGrid = selection
            .selectAll('#vertical-grid')
            .data([null])
            .join(
                (enter) => enter
                    .append('g')
                    .attr('class','gridlines')
                    .attr('id','vertical-grid')
            )
        ;
        xGrid
            .selectAll('line')
            .data(x.ticks())
            .join(
                (enter) => enter
                    .append('line')
                        .attr('x1', d => x(d))
                        .attr('x2', d => x(d))
                        .attr('y1', 0)
                        .attr('y2', height),
                (update) => update
                    .call(
                        (update) => update
                            .transition(t)
                            .attr('x1',d => x(d))
                            .attr('x2',d => x(d))
                    ),
                (exit) => exit.remove()
            )
        ;
        const yGrid = selection
            .selectAll('#horizontal-grid')
            .data([null])
            .join(
                (enter) => enter
                    .append('g')
                    .attr('class','gridlines')
                    .attr('id','horizontal-grid')
            )
        ;
        yGrid
            .selectAll('line')
            .data(y.ticks())
            .join(
                (enter) => enter
                    .append('line')
                        .attr('x1', 0)
                        .attr('x2', width)
                        .attr('y1', d => y(d))
                        .attr('y2', d => y(d)),
                (update) => update
                    .call(
                        (update) => update
                            .transition(t)
                            .attr('y1', d => y(d))
                            .attr('y2', d => y(d))
                    ),
                (exit) => exit.remove()
            )
        ;

        // Add shaded areas
        const g_non_playing = selection
            .selectAll('#non-playing-periods')
            .data([null])
            .join(
                (enter) => enter
                    .append('g')
                        .attr('id','non-playing-periods')
            )
        ;
        const g_timeframes = g_non_playing.selectAll('.timeframe')
            .data(timeframes)
            .join(
                (enter) => enter
                    .append('g')
                        .attr('class','timeframe')
                    .append('rect')
                        .attr('x', d => x(d.start))
                        .attr('y', height)
                        .attr('width', d => x(d.end) - x(d.start))
                        .attr('height', 0)
                    // .append('text')
                    //     .attr('x', d => (x(d.end) - x(d.start))/2)
                    //     .attr('y', 10)
                    //     .text(d => Object.hasOwn(d, 'label') ? d.label : null)
                    .call(
                        (enter) => enter
                            .transition(t)
                            .attr('y', 0)
                            .attr('height', height)
                    ),
                (update) => update
                    .call(
                        (update) => console.log(update._groups.childNodes)
                            // .transition(t)
                            // .attr('y', xValue === 'date' ? 0 : height)
                            // .attr('height', xValue === 'date' ? height : 0)
                    )
            )
        ;
        // g_timeframes
        //     .append('rect')
        //         .attr('x',d => x(d.start))
        //         .attr('y',0)
        //         .attr('width',d => x(d.end) - x(d.start))
        //         .attr('height',height)
        // ;
        // g_timeframes.selectAll('.timeframe')
        //     .data(timeframes)
        //     .join(
        //         (enter) => enter.append('g')
        //             .attr('class','timeframe'),
        //         (exit) => exit.transition(t).remove()
        //     )
        //     .select('rect')
        //         // .data(d => d)
        //         .join(
        //             (enter) => enter
        //                 .append('rect')
        //                     .attr('x', d => x(d.start))
        //                     .attr('y', height)
        //                     .attr('width', d => x(d.end) - x(d.start))
        //                     .attr('height', 0)
        //                 .call(
        //                     (enter) => enter
        //                         .transition(t)
        //                         .attr('y', 0)
        //                         .attr('height', height)
        //                 ),
        //             (update) => update
        //                 .call(
        //                     (update) => update
        //                         .transition(t)
        //                         .attr('y',xValue === 'date' ? 0 : height)
        //                         .attr('height', xValue === 'date' ? height : 0)
        //                 ),
        //             (exit) => exit
        //                 .call(
        //                     (exit) => exit
        //                         .transition(t)
        //                         .attr('height',0)
        //                         .attr('y',height)
        //                 )
        //                 .call(
        //                     (exit) => exit.transition(t).remove()
        //                 )
        //         )
        //     .selectAll('text')
        //     .data(d => d)
        //     .join(
        //         (enter) => enter.append('text')
        //             .attr('x', d => x(d.start) + (x(d.end) - x(d.start))/2)
        //             .attr('y', 10)
        //             .text(d => Object.hasOwn(d,'label') ? d.label : ''),
        //         (update) => update
        //             .call(
        //                 (update) => update
        //                     .transition(t)
        //                     .attr('opacity',xValue === 'date' ? 1 : 0)
        //             ),
        //         (exit) => exit.transition(t).remove()
        //     )
        ;
        // console.log(g_timeframes.selectAll('.timeframe').data(timeframes).datum());
        // g_timeframes.filter(d => Object.hasOwn(d,'label'))
        //     .data(timeframes)
        //     .join(
        //         (enter) => enter.append('text')
        //             .attr('x', d => x(d.start) + (x(d.end) - x(d.start))/2)
        //             .attr('y',10)
        //             .text(d => d.label),
        //         (update) => update
        //             .call(
        //                 (update) => update
        //                     .transition(t)
        //                     .attr('opacity',xValue === 'date' ? 1 : 0)
        //             ),
        //         (exit) => exit.transition(t).remove()
        //     )
        // ;

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
        
        const types = d3.group(data, (d) => d.manager_type);
        const permanents = d3.group(types.get("Permanent"), (d) => d.manager);
        const interims = d3.group(types.get("Interim"), (d) => d.manager);
        const caretakers = d3.group(types.get("Caretaker"), (d) => d.manager);

        const g_lines = selection
            .selectAll('#lines')
            .data([null])
            .join(
                (enter) => enter
                    .append('g')
                    .attr('id','lines')
            )
        ;

        const g_perm = g_lines
            .selectAll('#permanent_manager_paths')
            .data([null])
            .join(
                (enter) => enter.append('g')
                    .attr('id','permanent_manager_paths')
            )
        ;

        const g_interim = g_lines
            .selectAll('#interim_manager_paths')
            .data([null])
            .join(
                (enter) => enter.append('g').attr('id','interim_manager_paths')
            )
        ;

        const g_caretaker = g_lines
            .selectAll('#caretaker_manager_paths')
            .data([null])
            .join(
                (enter) => enter.append('g').attr('id','caretaker_manager_paths')
            )

        g_perm.selectAll('.permanent_manager_path')
                .data(permanents)
                .join(
                    (enter) => enter
                        .append('path')
                            .attr('class','permanent_manager_path')
                            .attr('d',(d) => line(d[1]))
                            .attr('stroke', (d) => colourMap.get(d[0]))
                            // .attr('fill','none')
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
        g_interim.selectAll('.interim_manager_path')
                .data(interims)
                .join(
                    (enter) => enter
                        .append('path')
                            .attr('class','interim_manager_path')
                            .attr('d',(d) => line(d[1]))
                            .attr('stroke', (d) => colourMap.get(d[0]))
                        .call(
                            (enter) => enter.transition(t).attr('d',(d) => line(d[1]))
                        ),
                    (update) => update
                        .call(
                            (update) => update.transition(t).attr('d',(d) => line(d[1]))
                        ),
                        (exit) => exit.remove()
                )
        ;
        g_caretaker.selectAll('.caretaker_manager_path')
                .data(caretakers)
                .join(
                    (enter) => enter
                        .append('path')
                            .attr('class','caretaker_manager_path')
                            .attr('d',(d) => line(d[1]))
                            .attr('stroke',(d) => colourMap.get(d[0]))
                        .call(
                            (enter) => enter.transition(t).attr('d',(d) => line(d[1]))
                        ),
                    (update) => update
                        .call(
                            (update) => update.transition(t).attr('d',(d) => line(d[1]))
                        ),
                    (exit) => exit.remove()
                )
        ;
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