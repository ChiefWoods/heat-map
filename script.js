// const width = 1603;
// const height = 540;
const paddingLeft = 144;
const paddingRight = 30;
const paddingTop = 40;
const paddingBottom = 128;
// const xOffset = 0;
const mapWidth = 1315;
const mapHeight = 396;

// function createDate(month) {
//   return new Date(0, month - 1);
// }

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(response => response.json())
  .then(dataset => {
    const width = 5 * Math.ceil(dataset.monthlyVariance.length / 12);
    const height = 396;
    const colorScheme = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695', '#000000']

    const xScale = d3.scaleLinear()
      .domain([d3.min(dataset.monthlyVariance, d => d.year), d3.max(dataset.monthlyVariance, d => d.year)])
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .range([0, height])

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'))
    const yAxis = d3.axisLeft(yScale).tickFormat(month => {
      return d3.timeFormat('%B')(new Date(0, month));
    })

    // Title
    d3.select('main')
      .append('text')
      .text('Monthly Global Land-Surface Temperature')
      .attr('id', 'title')
      .style('font-size', '2.4rem')
      .style('font-family', "Open Sans, sans-serif")
      .style('font-weight', 700)
      .style('margin-bottom', '20px')

    // Description
    d3.select('main')
      .append('text')
      .html(`1753 - 2015: base temperature ${dataset.baseTemperature}&#8451;`)
      .attr('id', 'description')
      .style('font-size', '1.85rem')
      .style('font-family', "'Open Sans', sans-serif")
      .style('font-weight', 700)

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

    // Main SVG
    const svg = d3.select('main')
      .append('svg')
      .style('width', width + paddingLeft + paddingRight)
      .style('height', height + paddingTop + paddingBottom)
    // .style('background-color', 'lightblue')

    // x-axis
    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(${paddingLeft}, ${height + paddingTop})`)
      .call(xAxis)
      .append('text')
      .text('Years')
      .attr('transform', `translate(${width / 2}, ${paddingBottom - 85})`)
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

    console.log(legendThreshold.domain().length)
    console.log(legendThreshold.range().length)

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
      // .attr('width', d => {
      //   return d[0] && d[1] ? legendXScale(d[1]) - legendXScale(d[0]) : legendXScale(null)
      // })
      .attr('width', d => legendXScale(d[1]) - legendXScale(d[0]))
      .attr('height', legendHeight)
      .style('fill', d => legendThreshold(d[0]))
      .style('stroke', 'black')
      .style('stroke-width', 1)

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendXAxis)

    // Cell
  })
  .catch(error => console.error(error));
