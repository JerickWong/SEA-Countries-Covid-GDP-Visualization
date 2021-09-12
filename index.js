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
    let data
    let types = Array.from(document.getElementsByClassName('types'))
    let countries = Array.from(document.getElementsByClassName('countries'))
    let quarters = Array.from(document.getElementsByClassName('quarters'))

    types = types.filter( t => t.checked)
    countries = countries.filter( c => c.checked)
    quarters = quarters.filter( q => q.checked)

    if (quarters.length === 1 && types.length === 1) {
      // Add X axis
      svg.selectAll("*").remove();

      let ti = {}
      if (types.length===1) {
        if (types[0].name==="Covid") {
          ti.x = 0
          ti.y = 1600000
          data = await d3.csv("/data/SEA Quarterly Confirmed COVID-19 Cases.csv")
        } else {
          ti.x = -20
          ti.y = 30
          data = await d3.csv("/data/SEA Quarterly GDP Growth Rate.csv")
        }
          
      }

      const x = d3.scaleLinear()
      .domain([ti.x, ti.y])
      .range([ 0, width]);

      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
    
      // Y axis
      const filtered = data.filter(d => { if (countries.find(c => c.name === d.Country)) return d.Country})
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
        .attr("x", x(ti.x))
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
  
  for (let type of types) {
    type.checked = true
  }

  update()
}