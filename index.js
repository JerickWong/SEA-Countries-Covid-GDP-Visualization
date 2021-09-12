let countryArray = []

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
    .attr("style", "background-color: white;")
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// x and x axis naman
// made dynamically moving

const y = d3.scaleBand()
  .range([ 0, height ])
const yAxis = svg.append("g")

async function update() {

    // Parse the Data
    const data = await d3.csv("/data/SEA Quarterly Confirmed COVID-19 Cases.csv")
    let types = Array.from(document.getElementsByClassName('types'))
    let countries = Array.from(document.getElementsByClassName('countries'))
    let quarters = Array.from(document.getElementsByClassName('quarters'))

    types = types.filter( t => t.checked)
    countries = countries.filter( c => c.checked)
    quarters = quarters.filter( q => q.checked)
    
    console.log(quarters)

    if (quarters.length === 1) {
      // Add X axis
      svg.selectAll("*").remove();

      const x = d3.scaleLinear()
        .domain([0, 1600000])
        .range([ 0, width]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
    
      // Y axis
      y
        .domain(data.map(d => d.Country))
        .padding(.1);
      svg.append("g")
        .call(d3.axisLeft(y))

      // variable u: map data to existing bars
      const u = svg.selectAll("rect")
      .data(data)

      // update bars
      u.join("rect")
      .transition()
      .duration(1000)
        .attr("x", x(0))
        .attr("y", d => y(d.Country))
        .attr("width", d => x(d[quarters[0].name]))
        .attr("height", y.bandwidth())
        .attr("fill", "#5891ad")
    
      //Bars
      // svg.selectAll("myRect")
      //   .data(data)
      //   .join("rect")
      //   .attr("x", x(0) )
      //   .attr("y", d => y(d.Country))
      //   .attr("width", d => x(d[quarters[0].name]))
      //   .attr("height", y.bandwidth())
      //   .attr("fill", "#5891ad")
    }
}


update()

function reset(classname) {
  let types = Array.from(document.getElementsByClassName(classname))
  types = types.filter( type => type.checked)
  
  for (let type of types) {
    type.checked = true
  }

  update()
}