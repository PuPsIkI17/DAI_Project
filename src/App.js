import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer'
import LandingPage from './routes/LandingPage/LandingPage';
import Details from './routes/Details/Details';

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <Route path="/" exact component={LandingPage} />
          <Route path="/planner" exact component={Details} />
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
