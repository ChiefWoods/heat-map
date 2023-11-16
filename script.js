d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(dataset => {
    const paddingLeft = 144;
    const paddingRight = 80;
    const paddingTop = 40;
    const paddingBottom = 128;
    const width = 1315;
    const height = 396;
    const colorScheme = d3.schemeRdYlBu[11].concat('#000000')

    const xScale = d3.scaleBand()
      .domain(dataset.monthlyVariance.map(d => d.year))
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(d3.range(12))
      .range([0, height])

    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(year => year % 10 === 0))
      .tickSize(10)

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => d3.timeFormat('%B')(new Date(0, month)))
      .tickSize(10)

    // Title
    d3.select('main')
      .append('h1')
      .text('Monthly Global Land-Surface Temperature')
      .attr('id', 'title')
      .style('font-size', '2.4rem')
      .style('font-family', "Open Sans, sans-serif")
      .style('font-weight', 700)
      .style('margin-bottom', '20px')

    // Description
    d3.select('main')
      .append('p')
      .html(`1753 - 2015: base temperature ${dataset.baseTemperature}&#8451;`)
      .attr('id', 'description')
      .style('font-size', '1.85rem')
      .style('font-family', "'Open Sans', sans-serif")
      .style('font-weight', 700)

    // Main SVG
    const container = d3.select('main')
      .append('div')
      .style('overflow-x', 'auto')
      .style('width', '100%')

    const svg = container.append('svg')
      .style('width', width + paddingLeft + paddingRight)
      .style('height', height + paddingTop + paddingBottom + 20)

    // x-axis
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(${paddingLeft}, ${height + paddingTop})`)
      .call(xAxis)
      .append('text')
      .text('Years')
      .attr('transform', `translate(${width / 2}, ${paddingBottom - 80})`)
      .style('fill', 'black')
      .style('text-anchor', 'middle')

    // y-axis
    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${paddingLeft}, ${paddingTop})`)
      .call(yAxis)
      .append('text')
      .text('Months')
      .attr('transform', `translate(${-paddingLeft + 40}, ${height / 2}) rotate(-90)`)
      .style('fill', 'black')
      .style('text-anchor', 'middle')

    // Legend
    const legendWidth = 400;
    const legendHeight = 300 / colorScheme.length;
    const variance = dataset.monthlyVariance.map(d => d.variance);
    const minTemp = dataset.baseTemperature + d3.min(variance);
    const maxTemp = dataset.baseTemperature + d3.max(variance);
    const step = (maxTemp - minTemp) / (colorScheme.length - 1);

    const legendThreshold = d3.scaleThreshold()
      .domain(d3.range(minTemp, maxTemp + step, step))
      .range(colorScheme.reverse());

    const legendXScale = d3.scaleLinear()
      .domain([minTemp - step, maxTemp + step])
      .range([0, legendWidth])

    const legendXAxis = d3.axisBottom(legendXScale)
      .tickSize(10)
      .tickValues(legendThreshold.domain())
      .tickFormat(d3.format('.1f'))

    const legend = svg.append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${paddingLeft}, ${paddingTop + height + paddingBottom - legendHeight * 2})`)

    legend.append('g')
      .selectAll('rect')
      .data(legendThreshold.range().map(color => {
        const d = legendThreshold.invertExtent(color);

        if (d[0] === null) {
          d[0] = legendXScale.domain()[0]
        }
        if (d[1] === null) {
          d[1] = legendXScale.domain()[1]
        }

        return d;
      }))
      .enter()
      .append('rect')
      .attr('x', d => legendXScale(d[0]))
      .attr('y', 0)
      .style('width', d => legendXScale(d[1]) - legendXScale(d[0]))
      .style('height', legendHeight)
      .style('fill', d => legendThreshold(d[0]))
      .style('stroke', 'black')
      .style('stroke-width', 1)

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendXAxis)

    // Tooltip
    const tooltip = d3.select('main')
      .append('div')
      .attr('id', 'tooltip')
      .style('visibility', 'hidden')
      .style('position', 'absolute')
      .style('opacity', 0.8)
      .style('background-color', 'black')
      .style('padding', '8px')
      .style('border-radius', '6px')
      .style('text-align', 'center')
      .style('color', 'white')
      .style('font-size', '1.6rem')
      .style('font-family', "'Open Sans', sans-serif")
      .style('white-space', 'nowrap')

    // Cell
    svg.selectAll('.cell')
      .data(dataset.monthlyVariance)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => Math.round((dataset.baseTemperature + d.variance) * 10) / 10)
      .attr('x', d => xScale(d.year) + paddingLeft)
      .attr('y', d => yScale(d.month - 1) + paddingTop)
      .style('width', d => xScale.bandwidth())
      .style('height', d => yScale.bandwidth(d.month - 1))
      .style('fill', d => legendThreshold(dataset.baseTemperature + d.variance))
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .on('mouseover', (e, d) => {
        tooltip.style('visibility', 'visible')
          .style('left', `${e.pageX - tooltip.node().offsetWidth / 2}px`)
          .style('top', `${yScale(d.month - 1) + paddingTop}px`)

        tooltip.html(
          `${d.year} - ${d3.timeFormat('%B')(new Date(0, d.month - 1))}<br>
          ${Math.round((dataset.baseTemperature + d.variance) * 10) / 10}&#8451;<br>
          ${d.variance > 0 ? '+' : ''}${Math.round(d.variance * 10) / 10}&#8451;`
        ).attr('data-year', d.year)

        d3.select(e.target)
          .style('stroke-width', 2)
      })
      .on('mouseout', e => {
        tooltip.style('visibility', 'hidden')

        d3.select(e.target)
          .style('stroke-width', 0)
      })
  }).catch(error => console.error(error));
