import React from 'react';

class LineGraph extends React.Component {
  constructor(props){
    super(props);
    this.state = {
     currentDate: new Date()
    }
  }
  componentDidMount(){
    let days = [];
    let month = this.state.currentDate.getMonth() + 1;
    let year = this.state.currentDate.getFullYear();
    let daysInMonth = this.daysInMonth(month, year);
    for (let i = 0; i <= daysInMonth; i++) {
      days.push(i);
    }
    let barCtx = document.getElementById('lineChart');
    let updatedBudgets = [0, 200, 1000, 400, 500, 250, 520, 110, 140, 120, 225, 151, 53, 20, 11, 80, 62, 250, 40, 300, 23, 500, 400, 250, 800];
    function randomColor() {
      let o = Math.round, r = Math.random, s = 230;
      return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
    }
    let randomColors = updatedBudgets.map(budget => budget > 0 ? randomColor() : 'rgba(255, 0, 0, 0.5)')
    var barGraph = new Chart(barCtx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Current Monthly Expenditure ($)',
          data: updatedBudgets,
          // backgroundColor: randomColors,
          // borderColor: randomColors,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
            yAxes: [{
                ticks: {
                  beginAtZero:true
                }
            }]
        }
      }
    });
  }

  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  render(){
    return(
      <div id="LineChart">
        <canvas id="lineChart"></canvas>
      </div>
    )
  }
}

export default LineGraph;