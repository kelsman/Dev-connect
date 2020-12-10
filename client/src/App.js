import React, { Fragment } from 'react';
import './App.css';
import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import { Route, Switch } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
function App() {
  return (
    <Fragment>
      <Navbar />
      <Route exact path="/" component={Landing} />
      <section className="container">

        <Switch>

          <Route exact path='/Login' component={Login} />
          <Route exact path='/Register' component={Register} />
        </Switch>
      </section>

    </Fragment>
  );
}

export default App;
