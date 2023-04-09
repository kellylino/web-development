window.onload = function () {
    showPage(0);
}

let barChartCount = 0;
let lineChartCount = 0;
let rowData = [];
let page;
let valueType;

function showPage(pageNumber, relative, parameter,title) {
    page = pageNumber;
    valueType = relative;
    rowData = [];

    let dataLink = 'http://webapi19sa-1.course.tamk.cloud/v1/weather';

     if(relative != null) {
        dataLink += "/" + relative;
        if(parameter !== null) {
            dataLink += "/" + parameter;
        }
    }

     document.getElementById('title').innerHTML = title;

    if (barChartCount > 0) {
        const barChart = document.getElementsByClassName('bar-container');
        if ((pageNumber > 1 && pageNumber < 7) || (pageNumber > 11 && pageNumber < 17)) {
            for (let i = 0; i < barChart.length; i++) {
                barChart[i].remove();
            }
        } else if ((pageNumber > 6 && pageNumber < 12) || pageNumber > 16 || pageNumber < 2) {
            for (let i = 0; i < barChart.length; i++) {
                barChart[i].remove();
            }
            barChartCount = 0;
        }
    }

    if (lineChartCount > 0) {
        const lineChart = document.getElementsByClassName('line-container');
        if ((pageNumber > 6 && pageNumber < 12) || pageNumber > 16) {
            for (let i = 0; i < lineChart.length; i++) {
                lineChart[i].remove();
            }
        } else if ((pageNumber > 1 && pageNumber < 7) || (pageNumber > 11 && pageNumber < 17) || pageNumber < 2) {
            for (let i = 0; i < lineChart.length; i++) {
                lineChart[i].remove();
            }
            lineChartCount = 0;
        }
    }

    const table = document.getElementById('table');
    table.innerHTML = "";

    const tableContainers = document.getElementsByClassName('table-container');
    for (let i = 0; i < tableContainers.length; i++) {
        if (pageNumber === 0) {
            tableContainers[i].style.display = 'none';
        } else {
            tableContainers[i].remove();
        }
    }

    if (pageNumber > 0) {
        document.getElementById('author_info').style.display = "none";

        fetch(dataLink)
            .then(response => response.json())
            .then(data => {
                let target = relative === null ? 'all' : relative;
                let count = parameter === null ? 20 : 500;

                switch (pageNumber) {
                    case 1:
                        target = 'all';
                        count = 30;
                        break;
                    case 7:
                        target = "temperature";
                        count = 25;
                        break;
                    case 17:
                        target = "wind_speed";
                        count = 25;
                        break;
                    case 22:
                        target = "rain";
                        count = 25;
                        break;
                    case 27:
                        target = "wind_direction";
                        count = 25;
                        break;
                    case 32:
                        target = "light";
                        count = 25;
                        break;
                }

                //
                rowData = data.map(obj => {
                    if (Object.keys(obj).includes('data')) {
                        obj['m_key'] = Object.keys(obj.data)[0];
                        obj['m_value'] = obj.data[obj['m_key']];
                    } else {
                        obj['m_key'] = target;
                        obj['m_value'] = obj[target];
                    }
                    return obj;
                }).filter(obj => {
                    return target === 'all' || obj.m_key === target;
                }).map(obj => {
                    obj['date_time'] = new Date(obj.date_time);
                    return obj;
                }).sort((a, b) => {
                    return a.date_time - b.date_time;
                }).filter((obj, idx) => {
                    return idx < count;
                });

                //
                if (rowData.length > 0) {
                    let headerRow = document.createElement('tr');
                    table.appendChild(headerRow);

                    let cols = ['Row Number', 'Date', 'Time', 'Value'];
                    if (pageNumber === 1) {
                        cols = ['Row Number', 'Date', 'Time', 'Type', 'Value'];
                    }

                    cols.forEach(text => {
                        const header = document.createElement('th');
                        headerRow.appendChild(header);

                        if (text === 'Value' && pageNumber !== 1) {
                            header.innerHTML = `<div class="dropdown">
                                                    <button class="dropbtn">Value<span class="icon">&#9660;</span></button>
                                                    <div class="dropdown-content">
                                                      <a onclick="sorting('increase')">increase</a>
                                                      <a onclick="sorting('decrease')">decrease</a>
                                                    </div>
                                                </div>`;
                        } else {
                            header.textContent = text;
                        }
                    });

                    let x_axis = [];
                    let y_axis = [];

                    rowData.forEach((obj, idx) => {
                        let row = table.insertRow();

                        let numberCell = row.insertCell();
                        numberCell.textContent = idx + 1;

                        let timeOptions = {timeZone: 'UTC', hourCycle: 'h23'};

                        let dateCell = row.insertCell();
                        dateCell.textContent = obj.date_time.toLocaleDateString('en-US', timeOptions);

                        let timeCell = row.insertCell();
                        timeCell.textContent = obj.date_time.toLocaleTimeString('en-US', timeOptions);

                        if (pageNumber === 1) {
                            let typeCell = row.insertCell();
                            typeCell.textContent = obj.m_key;
                        }

                        let valueCell = row.insertCell();
                        valueCell.textContent = obj.m_value;

                        x_axis[idx] = idx + 1;
                        y_axis[idx] = obj.m_value;
                    });

                    if (pageNumber !== 1) {
                        let tableContainer = document.createElement('div');
                        tableContainer.classList.add('table-container');
                        tableContainer.appendChild(table);
                        document.body.appendChild(tableContainer);
                    } else {
                        document.body.appendChild(table);
                    }

                    if ((pageNumber > 1 && pageNumber < 7) || (pageNumber > 11 && pageNumber < 17)) {
                        bar_char(x_axis, y_axis);
                    } else if ((pageNumber > 6 && pageNumber < 12) || pageNumber > 16) {
                        line_char(x_axis, y_axis);
                    }
                } else {
                    document.getElementById('notice').style.display = "block";
                    const tableContainers = document.getElementsByClassName('table-container');
                    for (let i = 0; i < tableContainers.length; i++) {
                         tableContainers[i].style.display = 'none';
                    }
                }
            }).catch(error => {
                document.getElementById('notice').style.display = "none";
                document.getElementById('error_message').textContent = "There was a problem loading the resource due to " + error + ". Please try again later.";
                document.getElementById('error_message').style.display = "block";
            });
    } else {
        document.getElementById('author_info').style.display = "block";
    }
}


function sorting(parameter) {
    if (parameter === "increase") {
        rowData.sort((a, b) => {
            return a.m_value - b.m_value;
        });
    } else {
        rowData.sort((a, b) => {
            return b.m_value - a.m_value;
        });
    }

    if (barChartCount > 0) {
        const barChart = document.getElementsByClassName('bar-container');
        for (let i = 0; i < barChart.length; i++) {
            barChart[i].remove();
        }
    }

    if (lineChartCount > 0) {
        const lineChart = document.getElementsByClassName('line-container');
        for (let i = 0; i < lineChart.length; i++) {
            lineChart[i].remove();
        }
    }

    let y_axis = [];
    let x_axis = [];

    const table = document.getElementById('table');
    table.innerHTML = "";
    const notice = document.getElementById('notice');
    notice.innerHTML = "";

    const tableContainers = document.getElementsByClassName('table-container');
    for (let i = 0; i < tableContainers.length; i++) {
        tableContainers[i].remove();
    }

    const headerRow = document.createElement('tr');
    const rowNumberHeader = document.createElement('th');
    rowNumberHeader.textContent = 'Row Number';
    headerRow.appendChild(rowNumberHeader);
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Date';
    headerRow.appendChild(dateHeader);
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time';
    headerRow.appendChild(timeHeader);
    const valueHeader = document.createElement('th');
    valueHeader.innerHTML = `
       <div class="dropdown">
        <button class="dropbtn">Value<span class="icon">&#9660;</span></button>
         <div class="dropdown-content">
          <a onclick="sorting('increase')">increase</a>
          <a onclick="sorting('decrease')">decrease</a>
         </div>
       </div>`;
    headerRow.appendChild(valueHeader);
    table.appendChild(headerRow);

    for (let i = 0; i < rowData.length; i++) {
        x_axis[i] = i + 1;
        const row = table.insertRow();
        const numberCell = row.insertCell();
        numberCell.textContent = i + 1;

        const date = new Date(rowData[i].date_time);
        const timeOptions = {timeZone: 'UTC', hourCycle: "h23"};

        const dateCell = row.insertCell();
        dateCell.textContent = date.toLocaleDateString('en-US', timeOptions);

        const timeCell = row.insertCell();
        timeCell.textContent = date.toLocaleTimeString('en-US', timeOptions);

        if (page === 7 || page === 17 || page === 22 || page === 27 || page === 32) {
            const valueCell = row.insertCell();
            valueCell.textContent = Object.values(rowData[i].data)[0];
            y_axis[i] = Object.values(rowData[i].data)[0];
        } else {
            const valueCell = row.insertCell();
            valueCell.textContent = rowData[i][valueType];
            y_axis[i] = rowData[i][valueType];
        }
    }

    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    tableContainer.appendChild(table);
    document.body.appendChild(tableContainer);

    if ((page > 1 && page < 7) || (page > 11 && page < 17)) {
        bar_char(x_axis, y_axis);
    } else if ((page > 6 && page < 12) || page > 16) {
        line_char(x_axis, y_axis);
    }
}

function bar_char(x, y) {
    barChartCount++;
    let barChart = document.createElement("canvas");
    barChart.setAttribute("id", "barChart")
    let ctx = barChart.getContext("2d");
    barChart.width = 550;
    barChart.height = 600;

    let chartData = {
        labels: x,
        datasets: [{
            data: y,
            backgroundColor: [
                'rgba(192, 169, 189, 0.5)',
                'rgba(148, 167, 174, 0.8)',
                'rgba(100, 119, 106, 0.5)',],
            borderColor: [
                'rgb(192, 169, 189)',
                'rgb(148, 167, 174)',
                'rgb(100, 119, 106)'
            ],
            borderWidth: 1
        }]
    };

    let chartOptions = {
        responsive: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value'
                },
                border: {
                    display: true,
                    color: '#64766A',
                    width: 2,
                },
                display: true,
                grid: {
                    color: '#64766A',
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: true,
                    lineWidth: 1
                },
                ticks: {
                    display: true,
                    color: '#64766A',
                    font: {
                        family: 'Arial',
                        size: 12,
                        style: 'normal',
                    },
                    padding: 3,
                    showLabelBackdrop: false,
                }
            },
            x: {
                border: {
                    display: true,
                    color: '#64766A',
                    width: 2,
                },
                display: true,
                grid: {
                    color: '#64766A',
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                    lineWidth: 0
                },
                ticks: {
                    display: true,
                    color: '#52675d',
                    font: {
                        family: 'Arial',
                        size: 12,
                        style: 'normal',
                    },
                    padding: 3,
                    showLabelBackdrop: false,
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: chartOptions
    });

    const chartContainer = document.createElement('div');
    chartContainer.classList.add('bar-container');
    chartContainer.appendChild(barChart);
    document.body.appendChild(chartContainer);
}

function line_char(x, y) {
    lineChartCount++;
    let lineChart = document.createElement("canvas");
    lineChart.setAttribute("id", "lineChart")
    let ctx = lineChart.getContext("2d");
    lineChart.width = 550;
    lineChart.height = 600;

    const chartData = {
        labels: x,
        datasets: [
            {
                label: "Line Chart",
                data: y,
                fill: false,
                borderColor: "#64766A",
                tension: 0.1
            }
        ]
    };

    let chartOptions = {
        responsive: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value'
                },
                border: {
                    display: true,
                    color: '#64766A',
                    width: 2,
                },
                display: true,
                grid: {
                    color: '#64766A',
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: true,
                    lineWidth: 1
                },
                ticks: {
                    display: true,
                    color: '#64766A',
                    font: {
                        family: 'Arial',
                        size: 12,
                        style: 'normal',
                    },
                    padding: 3,
                    showLabelBackdrop: false,
                }
            },
            x: {
                border: {
                    display: true,
                    color: '#64766A',
                    width: 2,
                },
                display: true,
                grid: {
                    color: '#64766A',
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false,
                    lineWidth: 0
                },
                ticks: {
                    display: true,
                    color: '#52675d',
                    font: {
                        family: 'Arial',
                        size: 12,
                        style: 'normal',
                    },
                    padding: 3,
                    showLabelBackdrop: false,
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    new Chart(ctx, {
        type: "line",
        data: chartData,
        options: chartOptions
    });

    const chartContainer = document.createElement('div');
    chartContainer.classList.add('line-container');
    chartContainer.appendChild(lineChart);
    document.body.appendChild(chartContainer);
}
