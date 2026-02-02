export const lineChart = () => {
    let width;
    let height;
    let margin;
    let data;
    let xValue;
    let yValue;
    let xType;
    let colourMap;


    const my = (selection) => {
        const x = (xType === 'date'
            ? d3.scaleTime()
                .domain([0,width])
            : d3.scaleLinear()
                .domain([0,width])
        );
        const y = d3.scaleLinear()
            .domain([height,0])
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
        x.domain(xType === 'date' ? d3.extent(data, d => d.date) : [d3.min(data, d => d.games_in_charge), d3.max(data, d => d.games_in_charge)]);
        y.domain(
            yValue === 'cumulative_gd'
            ? [d3.min(data,d => xType === 'date' ? d.cum_gd : d.manager_gd), d3.max(data, d => xType === 'date' ? d.cum_gd : d.manager_gd)]
            : (
                yValue === 'goals_scored'
                ? [d3.min(data, d => xType === 'date' ? d.cum_gf : d.manager_gf), d3.max(data, d => xType === 'date' ? d.cum_gf : d.manager_gf)]
                : [d3.min(data, d => xType === 'date' ? d.cum_ga : d.manager_ga), d3.max(data, d => xType === 'date' ? d.cum_ga : d.manager_ga)]
            )
        );

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
    }
}