let whiteHatData = [];
let blackHatData = [];

function createWhiteHat() {
    const container = d3.select("#white-hat-viz");
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height;

    const svg = container
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .style("font-family", "'Source Code Pro', monospace")
        .style("display", "block")
        .style("margin", "0 auto");

    const margin = { top: 40, right: -10, bottom: 20, left: 90 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(whiteHatData, d => d.TIME_PERIOD))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(whiteHatData, d => d.PCT_CHANGE) - 5, d3.max(whiteHatData, d => d.PCT_CHANGE) + 5]) // Adjusted the y scale
        .range([height - margin.bottom, margin.top]);

    // Colors
    const color = d3.scaleOrdinal(d3.schemeDark2)
        .domain([...new Set(whiteHatData.map(d => d.REF_AREA_NAME))]);

    // Line
    const line = d3.line()
        .x(d => x(d.TIME_PERIOD))
        .y(d => y(d.PCT_CHANGE))
        .curve(d3.curveMonotoneX);

    // Ticks
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .attr("color", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace");

    // Ticks
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d => `${d}%`))
        .attr("color", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace");

    // X-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 20)
        .attr("fill", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace")
        .text("Year");

    // Y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", margin.left / 4)
        .attr("x", -height / 2)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .attr("fill", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace")
        .text("% Change in CO2 Emission Rate (CO2 Equivalent KG / Person)");

    // Group by region and draw lines
    const groupedData = d3.group(whiteHatData, d => d.REF_AREA_NAME == "OECD" ? "OECD" : d.REF_AREA_NAME.replace("OECD ", ""));
    console.log("groupedData", groupedData);
    groupedData.forEach((data, key) => {
        // Lines
        const path = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color(key))
            .attr("stroke-width", 1.5)
            .attr("d", line);
        
        // Animation
        const totalLength = path.node().getTotalLength();
        path
            .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
    });

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left},${height + margin.bottom - 30})`)
        .style("font-family", "'Source Code Pro', monospace")
        .style("fill", "#d1d0c5");

    let legendOffsetX = 0;
    let legendOffsetY = 0;
    groupedData.forEach((_, key) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(${legendOffsetX}, ${30})`);

        legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color(key));

        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .attr("text-anchor", "start")
            .style("text-transform", "capitalize")
            .style("font-family", "'Source Code Pro', monospace")
            .style("fill", "white")
            .text(key);

        legendOffsetX += legendRow.node().getBBox().width + 20;
        if (legendOffsetX > width - margin.right) {
            legendOffsetX = 0;
            legendOffsetY += 20;
        }
    });

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#1f2022")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("font-family", "'Source Code Pro', monospace")
        .style("opacity", 0)
        .style("pointer-events", "none");

    // Tooltip handle render 
    groupedData.forEach((data) => {
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.TIME_PERIOD))
            .attr("cy", d => y(d.PCT_CHANGE))
            .attr("r", 5)
            .attr("fill", d => color(d.REF_AREA_NAME))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                const tooltipData = whiteHatData.filter(item => item.TIME_PERIOD === d.TIME_PERIOD);
                const tooltipHtml = tooltipData.map(item => `<span style="color:${color(item.REF_AREA_NAME == "OECD" ? "OECD" : item.REF_AREA_NAME.replace("OECD ", ""))}">${item.REF_AREA_NAME == "OECD" ? "OECD" : item.REF_AREA_NAME.replace("OECD ", "")}</span>: <span style="color: #d1d0c5">${item.PCT_CHANGE.toFixed(2)}%</span>`).join("<br><br>");
                tooltip.html(`2000 - ${d.TIME_PERIOD}<br><br>${tooltipHtml}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    });

    // Source Link
    svg.append("text")
        .attr("class", "source-link")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", margin.top - 20)
        .attr("fill", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text("Source: OECD Data Explorer")
        .on("click", () => window.open("https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_AIR_GHG%40DF_AIR_GHG&df[ag]=OECD.ENV.EPI&dq=OECDE%2BOECDSO%2BOECDA%2BOECD.A.GHG..KG_CO2E_PS&pd=2000%2C2022&to[TIME_PERIOD]=false", "_blank"))
        .style("cursor", "pointer");
}

function createBlackHat() {
    const container = d3.select("#black-hat-viz");
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height;

    const svg = container
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .style("font-family", "'Source Code Pro', monospace")
        .style("display", "block")
        .style("margin", "0 auto");

    const margin = { top: 40, right: -10, bottom: 20, left: 90 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Get top 10 OBS_VALUEs
    const top10Data = blackHatData.filter(d => d.OBS_VALUE >= 0).sort((a, b) => b.OBS_VALUE - a.OBS_VALUE).slice(0, 10);

    const x = d3.scaleBand()
        .domain(top10Data.map(d => d.REF_AREA))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    console.log("top10Data", top10Data);
    console.log("max OBS_VALUE", d3.max(top10Data, d => Number(d.OBS_VALUE)));

    const y = d3.scaleLinear()
        .domain([0, d3.max(top10Data, d => Number(d.OBS_VALUE))])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const yLevels = ["None", "Low", "Moderate", "High", "Very High"];

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .attr("color", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat((d, i) => yLevels[i]))
        .attr("color", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-48.75)");

    // Add x-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 20)
        .attr("fill", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace")
        .text("Country");

    // Add y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", margin.left / 4)
        .attr("x", -height / 2)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .attr("fill", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace")
        .text("Pollution Rate");

    // Define a color scale for the bars
    const color = d3.scaleLinear()
        .domain([d3.max(top10Data, d => Number(d.OBS_VALUE)), d3.min(top10Data, d => Number(d.OBS_VALUE))])
        .range(["#d95f02", "#2d649c"]);

    // Add bars with bounce transition
    svg.selectAll(".bar")
        .data(top10Data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.REF_AREA))
        .attr("y", height - margin.bottom)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", d => color(d.OBS_VALUE))
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`${d.REF_AREA_NAME}<br><span style="color:${color(d.OBS_VALUE)}">${d.OBS_VALUE}k KG / Person</span>`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .ease(d3.easeBounce)
        .attr("y", d => y(d.OBS_VALUE))
        .attr("height", d => y(0) - y(d.OBS_VALUE));

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#1f2022")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("font-family", "'Source Code Pro', monospace")
        .style("opacity", 0)
        .style("pointer-events", "none");

    // Add source link
    svg.append("text")
        .attr("class", "source-link")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", margin.top - 20)
        .attr("fill", "#d1d0c5")
        .style("font-family", "'Source Code Pro', monospace")
        .style("font-size", "12px")
        .style("text-decoration", "underline")
        .text("Source: OECD Data Explorer")
        .on("click", () => window.open("https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_AIR_GHG%40DF_AIR_GHG&df[ag]=OECD.ENV.EPI&dq=GBR%2BTUR%2BCHE%2BSWE%2BSVN%2BESP%2BSVK%2BPOL%2BPRT%2BNOR%2BNZL%2BNLD%2BMEX%2BLUX%2BLTU%2BLVA%2BKOR%2BJPN%2BITA%2BISR%2BIRL%2BISL%2BHUN%2BGRC%2BDEU%2BFRA%2BFIN%2BEST%2BDNK%2BCZE%2BCRI%2BCOL%2BCHL%2BCAN%2BBEL%2BAUT%2BAUS%2BUSA.A.GHG._T%2BT_LULU.KG_CO2E_PS&pd=2000%2C2022&to[TIME_PERIOD]=false", "_blank"))
        .style("cursor", "pointer");
}

function mapWhiteHatData(data) {
    const groupedData = d3.group(data, d => d.REF_AREA);

    whiteHatData = [];
    groupedData.forEach((group) => {
        group.sort((a, b) => d3.ascending(a.TIME_PERIOD, b.TIME_PERIOD));

        const firstDataPoint = group[0].OBS_VALUE;

        group.forEach((d) => {
            const pctChange = ((d.OBS_VALUE - firstDataPoint) / firstDataPoint) * 100;
            whiteHatData.push({
                REF_AREA: d.REF_AREA,
                REF_AREA_NAME: d["Reference area"],
                TIME_PERIOD: d.TIME_PERIOD,
                OBS_VALUE: d.OBS_VALUE,
                PCT_CHANGE: pctChange
            });
        });
    });
}

function mapBlackHatData(data) {
    const groupedData = d3.group(data, d => d.REF_AREA);

    blackHatData = [];
    groupedData.forEach((group) => {
        group.sort((a, b) => d3.descending(a.OBS_VALUE, b.OBS_VALUE));

        group.forEach((d) => {
            blackHatData.push({
                REF_AREA: d.REF_AREA,
                REF_AREA_NAME: d["Reference area"],
                OBS_VALUE: d.OBS_VALUE
            });
        });
    });
}

function setupToggleButtons() {
    // Get all writeup buttons
    const writeupButtons = document.querySelectorAll('.writeup-button');

    writeupButtons.forEach(button => {
        const vizContainer = button.closest('.viz-container');

        let vizContent = vizContainer.querySelector('.viz-content');
        if (!vizContent) {
            vizContent = document.createElement('div');
            vizContent.className = 'viz-content';

            const isWhiteHat = vizContainer.querySelector('.white-hat') !== null;
            const vizId = document.createElement('div');
            vizId.id = isWhiteHat ? 'white-hat-viz' : 'black-hat-viz';
            
            vizContent.appendChild(vizId);
            vizContainer.appendChild(vizContent);
        }

        // Writeup Content
        let writeupContent = vizContainer.querySelector('.writeup-content');
        if (!writeupContent) {
            writeupContent = document.createElement('div');
            writeupContent.className = 'writeup-content';
            writeupContent.style.display = 'none';
            writeupContent.style.height = 'calc(100% - 50px)';
            writeupContent.style.overflowY = 'auto';

            const writeupText = document.createElement('div');
            writeupText.className = 'writeup-text';
            
            const isWhiteHat = vizContainer.querySelector('.white-hat') !== null;
            
            writeupText.innerHTML = isWhiteHat ? 
            `<p>For the white hat visualization, we chose to use the Greenhouse Gas Emissions dataset, specifically in the range of 2000 to 2022. Additionally, we further pared down the dataset into combined Greenhouse Gas (GHG) rates measured in CO2 Equivalent KG / Person for the aggregated Organisation for Economic Co-operation and Development (OECD) regions Europe, America, and Asia Oceania, and the total OECD rates. After downloading the CSV, we removed unnecessary data such as STRUCTURE, STRUCTURE_ID, and other redundant and duplicate columns from the dataset via Python's Pandas library to ensure fast loading in the browser. Finally, we augmented the dataset by calculating the percentage of the delta between GHG emission rates in 2000 and at every year until 2022 in javascript before plotting the data.</p>
                <br>   
                <p>In terms of design choices, we took special care to correctly label axes with the proper units and concise labels such as % Change in CO2 Equivalent KG / Person. Secondly, we chose an appropriate color palette to use globally across the data visualization as well as a load animation and smoothed line charts providing a cohesive and well flowing modern experience to the user. Finally, instead of using raw emission rate values for the chart data, we opted to use the percentage delta from the start of the selected dataset in order to provide a more normalized view of the GHG reduction process across various regions. This benefits the user as certain regions might have abnormally different raw emission rates at the start of the millennium, and therefore percentage change is a more generalizable and digestible metric for progress comparison across separate populations. Finally, for curious users, we added a link to the OECD Data Explorer, set with the filters we used to get our original non-pre-processed dataset, such that they can explore the dataset themselves. We made use of AI for debugging purposes particularly with styling and animation issues.</p>`
                :
                `<p>For the black hat visualization, we again chose the Greenhouse Gas Emissions dataset also in the range of 2000 to 2022. However, for the adversarial visualization, we decided to incorporate not only land Use and forestry exclusionary GHG emission data, but both land use and non land use datasets for individual OECD countries of which there are about 38. Using pandas we parsed out US land use inclusionary GHG emission data and land use exclusionary GHG emission data for the rest of the OECD countries for which we picked the lowest GHG emission rate years. Finally, we applied the same dimensionality reduction as the white hat visualization by removing redundant columns before charting the processed data.</p>
                <br>
                <p>Using this dataset, we set about implementing some devious manipulations. Firstly, we further processed the data such that we cherry picked the year with the largest per capita land inclusionary GHG emission rates for the United States, then we cherry picked the years with the smallest land exclusionary GHG emission rates for each other country. Naturally, land inclusionary data will show outsized rates when compared with exclusionary data due to deforestation and farming. Additionally we picked the maximum rate year, artificially boosting the "pollution rates" of the US in comparison to other OECD countries. Next, we created a vague and misleading title "Largest International Polluters" which does not specify exactly what kind of pollution (plastic, GHG, radioactive, etc) or what type of polluter (nations, corporations, individuals, etc). The title also implies the false claim that the black hat visualization is representative of composite pollution rates across all nations, when it is really only representative of OECD member nations' GHG emission rates. With regards to the chart itself, we implemented an arbitrary set of discrete "pollution levels" dividing the y-axis scale into  5 equal parts without any actual units presented, providing a muddy picture as to what the chart is actually measuring. We also added a color gradient to the bars, further emphasizing that the U.S is (falsely) the world's largest polluter. As a backstop for more curious users we implemented a tooltip describing a vague KG / Person metric which maps to actual CO2 Equivalent KG / Person values, however it is not clear to the user what exactly the number is measuring from the visualization. For a final appeal to authority, we linked the original dataset in an attempt to give the chart more legitimacy. Ultimately, this blackhat visualization falsely places the U.S and other western countries as the "villains" of climate change in the eyes of viewers by obfuscating the values that are actually being graphed and instead emphasizing an unclear understanding of pollution rates with the goal of negatively polarizing users against the U.S. We made use of AI for debugging purposes particularly with styling and animation issues.</p>
                `;
            
            writeupContent.appendChild(writeupText);
            vizContainer.appendChild(writeupContent);
        }

        button.addEventListener('click', () => {
            const isShowingViz = vizContent.style.display !== 'none';
            
            if (isShowingViz) {
                vizContent.style.display = 'none';
                writeupContent.style.display = 'block';
                button.textContent = 'Show Visualization';
            } else {
                vizContent.style.display = 'block';
                writeupContent.style.display = 'none';
                button.textContent = 'Read Writeup';
            }
        });
    });
}

function init() {
    d3.csv("./data/white-hat-data-preprocessed.csv").then(whitehat_data => {
        d3.csv("./data/black-hat-data-preprocessed.csv").then(blackhat_data => {
            mapWhiteHatData(whitehat_data);
            mapBlackHatData(blackhat_data);
            createWhiteHat();
            createBlackHat();
            setupToggleButtons();
        });
    });
}

window.addEventListener('load', init);
window.addEventListener('load', init);