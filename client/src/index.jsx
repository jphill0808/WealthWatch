import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Chart from 'chart.js';
import Graph from './components/Graph.jsx';
import InputBalance from './components/inputBalance.jsx';
import Clock from './components/clock.jsx';
import Weather from './components/weather.jsx';
import LoginSignup from './components/previousLoginSignupForm.jsx';
import axios from 'axios';
import Expenses from './components/expenses.jsx'
import Paper from 'material-ui/Paper';
import NPVCalculator from './components/npvCalculator.jsx'
import $ from 'jquery';
import { BrowserRouter, Route } from 'react-router-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    const jwtToken = window.localStorage.getItem('wealthwatch_token') || '';
    const email = window.localStorage.getItem('user_email');
    this.state = {
      budget: 7000,
      one: [],
      rec: [],
      budgetInput: false,
      currentDate: new Date(),
      token: jwtToken,
      loggedIn: !!jwtToken,
      currentEmail: email,
      currentBarGraph: null,
      currentLineGraph: null,
      currency: '',
    };
    this.getCurrentDate = this.getCurrentDate.bind(this);
    this.setLoginState = this.setLoginState.bind(this);
    this.setLogoutState = this.setLogoutState.bind(this);
    this.getCurrentEmail = this.getCurrentEmail.bind(this);
    this.renderGraph = this.renderGraph.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.resetUser = this.resetUser.bind(this);
    this.currencySymbols = this.currencySymbols.bind(this);
    this.updateCurrency = this.updateCurrency.bind(this);
  }

  componentDidMount() {
    this.renderGraph();
    this.updateUser();
    console.log('THIS IS THE TOKENNNNN', this.state.currentEmail);
    $(document).on('click', 'a[href^="#"]', function(event) {
      event.preventDefault();

      $('html, body').animate(
        {
          scrollTop: $($.attr(this, 'href')).offset().top,
        },
        700
      );
    });
    console.log('THIS IS THE ONETIME EXPENSES UPON LOADING', this.state.one);
    console.log('THIS IS THE RECURRING EXPENSES UPON LOADING', this.state.rec);

    // this.updateUser();
  }

  resetUser() {
    axios.post('/reset', { email: this.state.currentEmail })
    .then((response) => {
      this.updateUser();
    })
  }

  updateCurrency(currency) {
    this.setState({ currency: currency });
  }

  updateUser() {
    axios.post('/user', { email: this.state.currentEmail }).then((response) => {
      console.log('RESPONSE DATAAAA', response.data);
      if (!response.data.budget) {
        response.data.budget = '7777';
      }
      this.setState({ budget: Number(response.data.budget), one: response.data.oneTime, rec: response.data.recurring, currency: response.data.currency });
      console.log('THIS IS THE CURRENCY WE RECEIVE FROM THER SERVER', response.data.currency);
      this.renderGraph();
    })
  }

  renderGraph() {
    if (this.state.currentBarGraph) {
      this.state.currentBarGraph.destroy();
    }
    if (this.state.currentLineGraph) {
      this.state.currentLineGraph.destroy();
    }
    let days = [];
    let budget = [];
    let expenses = [];
    let day = this.state.currentDate.getDate();
    let month = this.state.currentDate.getMonth() + 1;
    let year = this.state.currentDate.getFullYear();
    let totalRecExp = 0;
    console.log('THIS IS THE CURRENT DAY AND MONTH FOR THE STATE', day, '//', month, '//', year)
    let daysInMonth = this.daysInMonth(month, year);
    for (let i = 0; i <= daysInMonth; i++) {
      days.push(i);
    }
    for (let i = 0; i <= daysInMonth; i++) {
      budget.push(this.state.budget)
      expenses.push(0);
    }
    for (let i = 0; i < this.state.one.length; i++) {
      var expenseAmount = this.state.one[i].amount;
      console.log('THIS STATE ONE', new Date(this.state.one[i].date).getDate());
      var expenseDay = new Date(this.state.one[i].date).getDate();
      console.log('THIS IS THE EXPENSE DAY', expenseDay);
      var expenseMonth = new Date(this.state.one[i].date).getMonth() + 1;
      var expenseYear = new Date(this.state.one[i].date).getFullYear();
      console.log(
        'THIS IS THE CURRENT DAY AND MONTH AND YEAR FOR THE EXPENSES',
        expenseDay,
        '//',
        expenseMonth,
        '//',
        expenseYear
      );
      if (expenseYear === year && expenseMonth === month) {
        expenses[expenseDay] += expenseAmount;
        for (let j = expenseDay; j <= daysInMonth; j++) {
          budget[j] = budget[j] - expenseAmount;
        }
      }
    }
    for (let i = 0; i < this.state.rec.length; i++) {
      var expenseAmount = this.state.rec[i].amount;
      totalRecExp = totalRecExp + expenseAmount;
      for (let j = 1; j < budget.length; j++) {
        budget[j] = budget[j] - expenseAmount;
      }
    }
    expenses[1] = totalRecExp;
    console.log(budget);
    let barCtx = document.getElementById('barChart');
    let lineCtx = document.getElementById('lineChart');

    // console.log(barCtx)
    let updatedBudgets = budget;
    let positiveColor = 'rgba(54, 162, 235, 0.7)';

    let color = updatedBudgets.map((budget, index) => {
      if (budget > 0) {
        if (index <= this.state.currentDate.getDate()) {
          return positiveColor;
        } else {
          return 'rgba(54, 162, 235, 0.3)';
        }
      } else {
        return 'rgba(255, 0, 0, 0.5)';
      }
    });

    var lineGraph = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: `Current Monthly Expenditure (${this.state.currency})`,
            data: expenses,
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            borderColor: 'rgba(255, 0, 0, 0.5)',
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });

    var barGraph = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: `Current Monthly Balance (${this.state.currency})`,
            data: updatedBudgets,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
    this.setState({ currentBarGraph: barGraph });
    this.setState({ currentLineGraph: lineGraph });
  }

  currencySymbols() {
    switch(this.state.currency) {
      case '':
        return <span>&nbsp;&nbsp;</span>;
      case 'USD':
        return <span>&#36;</span>;
      case 'AUD':
        return <span>&#36;</span>;
      case 'BRL':
        return <span>R&#36;</span>;
      case 'CAD':
        return <span>&#36;</span>;
      case 'CZK':
        return <span>&#x4b;&#x10d;</span>;
      case 'DKK':
        return <span>&#x6b;&#x72;</span>;
      case 'EUR':
        return <span>&#x20ac;</span>;
      case 'HKD':
        return <span>&#36;</span>;
      case 'HUF':
        return <span>&#x46;&#x74;</span>;
      case 'ILS':
        return <span>&#x20aa;</span>;
      case 'KOR':
        return <span>&#x20a9;</span>;
      case 'JPY':
        return <span>&#xa5;</span>;
      case 'MYR':
        return <span>&#x52;&#x4d;</span>;
      case 'MXN':
        return <span>&#x24;</span>;
      case 'IDR':
        return <span>&#x52;&#x70;</span>;
      case 'NOK':
        return <span>&#x6b;&#x72;</span>;
      case 'NZD':
        return <span>&#x24;</span>;
      case 'PHP':
        return <span>&#x20b1;</span>;
      case 'PLN':
        return <span>&#x7a;&#x142;</span>;
      case 'GBP':
        return <span>&#xa3;</span>;
      case 'SGD':
        return <span>&#x53;&#x24;</span>;
      case 'SEK':
        return <span>&#x6b;&#x72;</span>;
      case 'CHF':
        return <span>&#x43;&#x48;&#x46;</span>;
      case 'TWD':
        return <span>&#x4e;&#x54;&#x24;</span>;
      case 'THB':
        return <span>&#xe3f;</span>;
      case 'TRY':
        return <span>&#x54;&#x4c;</span>;
      case 'CNY':
        return <span>&#xa5;</span>;
    }
  }

  getCurrentEmail(email) {
    this.setState({ currentEmail: email })
  }

  getCurrentDate(date) {
    this.setState({ currentDate: date });
  }

  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  setLoginState(token, email) {
    this.setState({
      loggedIn: true,
      token: token,
      currentEmail: email
    });
    // this.renderChart();
    window.localStorage.setItem('wealthwatch_token', token);
    window.localStorage.setItem('user_email', email);
    window.localStorage.setItem('currency', currency);
  }

  setLogoutState(event) {
    event.preventDefault();
    this.setState({
      loggedIn: false,
      token: '',
    });
    window.localStorage.removeItem('wealthwatch_token');
    window.localStorage.removeItem('user_email');
  }

  getAuthentication() {
    return this.state.token;
  }

  getCurrentEmail(email) {
    this.setState({ currentEmail: email });
  }

  getCurrentDate(date) {
    this.setState({ currentDate: date });
  }

  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  setLoginState(token, email) {
    this.setState({
      loggedIn: true,
      token: token,
      currentEmail: email
    });
    // this.renderChart();
    window.localStorage.setItem('wealthwatch_token', token);
    window.localStorage.setItem('user_email', email);
  }

  setLogoutState(event) {
    event.preventDefault();
    this.setState({
      loggedIn: false,
      token: '',
    });
    window.localStorage.removeItem('wealthwatch_token');
    window.localStorage.removeItem('user_email');
  }

  getAuthentication() {
    return this.state.token;
  }

  render() {
    if (!this.state.loggedIn) {
      return (
        <div>
          <MuiThemeProvider>
            <LoginSignup
              updateUser={this.updateUser}
              getCurrentEmail={this.getCurrentEmail}
              setLoginState={this.setLoginState}
              setLogoutState={this.setLogoutState}
            />
          </MuiThemeProvider>
        </div>
      );
    } else {
      return (
        <div>
          <div id="widget" className="widget">
            <Clock getCurrentDate={this.getCurrentDate} />
            <Weather getAuthentication={this.getAuthentication} />
          </div>
          <MuiThemeProvider>
            <Graph one={this.state.one} rec={this.state.rec} currentEmail={this.state.currentEmail} />
            <br/>
            <InputBalance currency={this.state.currency} updateCurrency={this.updateCurrency} currencySymbols={this.currencySymbols} updateUser={this.updateUser} currentEmail={this.state.currentEmail} />
            <Expenses currencySymbols={this.currencySymbols} updateUser={this.updateUser} currentEmail={this.state.currentEmail} />
            <NPVCalculator currency={this.currencySymbols(this.state.currency)} />
          </MuiThemeProvider>
          <br/>

          <button onClick={this.setLogoutState} type="" className="btn btn-danger">Logout</button>
          <a href="#widget" style={{margin:'7px'}} onClick={this.resetUser} className="btn btn-default">Reset Expenses</a>
        </div>
      );
    }
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

