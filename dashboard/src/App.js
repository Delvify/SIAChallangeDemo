import React, { useEffect, useState } from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import { Provider } from "react-redux";
import jwtDecode from "jwt-decode";
import { connect } from "react-redux";

import store from "./store";
import './App.scss';
import { logoutUser, setCurrentUser } from "./actions/authAction";

import "../node_modules/slick-carousel/slick/slick.css";
import "../node_modules/slick-carousel/slick/slick-theme.css";

const loadingComponent = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Pages/Login'));
const Register = React.lazy(() => import('./views/Pages/Register'));
const Page404 = React.lazy(() => import('./views/Pages/Page404'));
const Page500 = React.lazy(() => import('./views/Pages/Page500'));

const mapStateToProps = (state) => ({
  auth: state.auth,
});

const App = (props) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (localStorage.jwtToken) {
      const token = localStorage.jwtToken;
      const decoded = jwtDecode(token);
      const currentTime = Date.now();
      if (decoded.exp < currentTime) {
        store.dispatch(logoutUser())
          .then(() => {
            setLoading(false);
            window.location.href = "/login";
          });
      } else {
        store.dispatch(setCurrentUser({ admin: decoded, token, merchantid: decoded.merchantid }))
          .then(() => {
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, []);


  const PrivateRoute = ({ component: Component, auth, ...others }) => {
    return (
      <Route
        {...others}
        render={ props => loading ? loadingComponent() : window._.isEmpty(auth.admin) ? <Redirect to="/login" /> : <Component {...props} /> }
      />
    );
  };

  const EnhancedPrivateRoute = connect(mapStateToProps)(PrivateRoute);

  return (
    <Provider store={store}>
      <HashRouter>
          <React.Suspense fallback={loadingComponent()}>
            <Switch>
              <Route exact path="/register" name="Register Page" render={props => <Register {...props}/>} />
              <Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>} />
              <Route exact path="/500" name="Page 500" render={props => <Page500 {...props}/>} />
              <Route exact path="/login" name="Login Page" render={props => <Login {...props}/>} />
              <Switch>
                <EnhancedPrivateRoute path="/" name="Home" component={DefaultLayout} {...props} />
              </Switch>
            </Switch>
          </React.Suspense>
      </HashRouter>
    </Provider>
  );
};

export default App;
