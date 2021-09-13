const colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999', '#321231', '#002299']

const countries = Array.from(document.getElementsByClassName('countries'))
countries.forEach((country, index) => {
  let child = country.nextSibling
  child.style.color = colors[index]
})

const inputs = Array.from(document.getElementsByTagName('input'))
inputs.forEach(input => {
  input.checked = true
  input.type = "checkbox"
  input.onclick = update
})


// set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("style", "background-color: white;;margin: 20px")
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// x and x axis naman
// made dynamically moving

let y = d3.scaleBand()
  .range([ 0, height ])
const yAxis = svg.append("g")

async function update() {

    // Parse the Data
    let data
    let types = Array.from(document.getElementsByClassName('types'))
    let countries = Array.from(document.getElementsByClassName('countries'))
    let quarters = Array.from(document.getElementsByClassName('quarters'))

    types = types.filter( t => t.checked)
    countries = countries.filter( c => c.checked)
    quarters = quarters.filter( q => q.checked)

    let combined = document.getElementById('combined')

    if (combined.checked) {
      combinedGraph()
    }

    else if (quarters.length === 1 && types.length === 1) {
      // Add X axis
      svg.selectAll("*").remove();

      if (types[0].name==="Covid") {
        data = await d3.csv("/data/SEA Quarterly Confirmed COVID-19 Cases.csv")
      } else {
        data = await d3.csv("/data/SEA Quarterly GDP Growth Rate.csv")
      }

      const x = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return +d[quarters[0].name]; }), d3.max(data, function(d) { return +d[quarters[0].name] })])
      .range([ 0, width]);

      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
    
      // Y axis
      const filtered = data.filter(d => { if (countries.find(c => c.name === d.Country)) return d.Country})
      
      y = d3.scaleBand()
      .range([ 0, height ])

      y
        .domain(filtered.map(f => f.Country))
        .padding(.1);
      svg.append("g")
        .call(d3.axisLeft(y))

      // variable u: map data to existing bars
      const u = svg.selectAll("rect")
      .data(filtered)

      // update bars
      u.join("rect")
      .transition()
      .duration(1000)
        .attr("x", x(d3.min(data, function(d) { return +d[quarters[0].name]; })))
        .attr("y", d => y(d.Country))
        .attr("width", d => x(d[quarters[0].name]))
        .attr("height", y.bandwidth())
        .attr("fill", "#5891ad")
    }
}

async function combinedGraph() {

  let data
  let types = Array.from(document.getElementsByClassName('types'))
  let countries = Array.from(document.getElementsByClassName('countries'))
  let quarters = Array.from(document.getElementsByClassName('quarters'))

  let filteredColors = [...colors]

  for (let i = countries.length-1; i >= 0; i--) {
    if (!countries[i].checked)
      filteredColors.splice(i, 1)
  }
  types = types.filter( t => t.checked)
  countries = countries.filter( c => c.checked)
  quarters = quarters.filter( q => q.checked)

  if (types.length === 1 && types[0].name === "Covid") {
    data = await d3.csv("/data/SEA Quarterly Confirmed COVID-19 Cases.csv")
  } else {
    data = await d3.csv("/data/SEA Quarterly GDP Growth Rate.csv")
  }
  
  data = data.filter(d => { if (countries.find(c => c.name === d.Country)) return d.Country})
  console.log(data)

  const newData = [] 
  quarters.forEach(q => data.forEach(d => newData.push({Country: d.Country, year: q.name, n: Number(d[q.name])})))
  
  // group the data: I want to draw one line per group
  const sumstat = d3.group(newData, d => d.Country); // nest function allows to group the calculation per level of a factor
  console.log(newData)
  // Add X axis --> it is a date format
  const x = d3.scaleBand([0, width])
    .domain(quarters.map(q => q.name))
    .rangeRound([ 0, width ])
    .padding(1);
  
  svg.selectAll("*").remove();
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  y = d3.scaleLinear()
    // .domain([0, d3.max(newData, function(d) { return +d.n; })])
    .domain(d3.extent(newData, function(d) { return +d.n; }))
    .range([ height, 0 ])

  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette
  const color = d3.scaleOrdinal()
    .range(filteredColors)

  // Draw the line
  svg.selectAll(".line")
      .data(sumstat)
      .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(+d.n); })
            (d[1])
        })
    
}

async function multiGraph() {
  //Read the data
  d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv").then( function(data) {
    
    // group the data: I want to draw one line per group
    const sumstat = d3.group(data, d => d.name) // nest function allows to group the calculation per level of a factor

    // What is the list of groups?
    let allKeys = new Set(data.map(d=>d.name))

    // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
    const svg = d3.select("#my_dataviz")
      .selectAll("uniqueChart")
      .data(sumstat)
      .enter()
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "background-color: white;margin: 20px")
      .append("g")
        .attr("transform", 
              `translate(${margin.left},${margin.top})`);

    // Add X axis --> it is a date format
    const x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d.year; }))
      .range([ 0, width ]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(3));

    //Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.n; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // color palette
    const color = d3.scaleOrdinal()
      //.domain(allKeys)
      .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    // Draw the line
    svg
      .append("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d[0]) })
        .attr("stroke-width", 1.9)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(+d.n); })
            (d[1])
        })

    // Add titles
    svg
      .append("text")
      .attr("text-anchor", "start")
      .attr("y", -5)
      .attr("x", 0)
      .text(function(d){ return(d[0])})
      .style("fill", function(d){ return color(d[0]) })

  })
}

update()

function reset(classname) {
  let types = Array.from(document.getElementsByClassName(classname))
  
  for (let type of types) {
    type.checked = true
  }

  update()
}