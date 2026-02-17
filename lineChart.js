export const lineChart = () => {
    let width;
    let height;
    let data;
    let xValue;
    let yValue;
    let xType;
    let colourMap;
    let timeframes;


    const my = (selection) => {
        const x = (xValue === 'date'
            ? d3.scaleTime()
                .range([0,width])
            : d3.scaleLinear()
                .range([0,width])
        );
        const y = d3.scaleLinear()
            .range([height,0])
        ;

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

        // Set x and y domains based on the x/y value selected
        x.domain(xValue === 'date' ? d3.extent(data, d => d.date) : [0, d3.max(data, d => d.games_in_charge)]);
        y.domain(
            yValue === 'cumulative_gd'
            ? [d3.min(data,d => xValue === 'date' ? d.cum_gd : d.manager_gd), d3.max(data, d => xValue === 'date' ? d.cum_gd : d.manager_gd)]
            : (
                yValue === 'goals_scored'
                ? [d3.min(data, d => xValue === 'date' ? d.cum_gf : d.manager_gf), d3.max(data, d => xValue === 'date' ? d.cum_gf : d.manager_gf)]
                : [d3.min(data, d => xValue === 'date' ? d.cum_ga : d.manager_ga), d3.max(data, d => xValue === 'date' ? d.cum_ga : d.manager_ga)]
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

        const g_lines = selection.append('g').attr('id','lines');
        g_lines.append('g')
            .attr('id','permanent_manager_paths')
            .selectAll('.permanent_manager_path')
                .data(permanents)
                .join('path')
                    .attr('d',(d) => line(d[1]))
                    .attr('stroke', (d) => colourMap.get(d[0]))
        ;
        g_lines.append('g')
            .attr('id','interim_manager_paths')
            .selectAll('.interim_manager_path')
                .data(interims)
                .join('path')
                    .attr('d',(d) => line(d[1]))
                    .attr('stroke',(d) => colourMap.get(d[0]))
        ;
        g_lines.append('g')
            .attr('id','caretaker_manager_paths')
            .selectAll('.caretaker_manager_path')
                .data(caretakers)
                .join('path')
                    .attr('d',(d) => line(d[1]))
                    .attr('stroke',(d) => colourMap.get(d[0]))
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

    my.xType = function (_) {
        return arguments.length ? ((xType = _),my) : xType;
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