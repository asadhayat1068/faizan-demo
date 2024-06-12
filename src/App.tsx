import React from "react";
import { BrowserRouter as Router } from "react-router-dom"; // Importing BrowserRouter as Router
import MainRouter from './routes/main'; // Importing the MainRouter component

import Header from './components/Header/Header';
import './App.css';
import './styles/tailwind.css'; 

function App() {
  return (
    <Router>
      <div className="page-wrapper">
        <div id="header">
          <Header/>
        </div>
        <div id="main">
        
          <MainRouter />
        </div>
      </div>
    </Router>
  );
}

export default App;
