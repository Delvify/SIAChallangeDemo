import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import { routerMiddleware } from 'react-router-redux';
import { createHashHistory } from 'history';


const reduxRouterMiddleware = routerMiddleware(createHashHistory());
const middleware = [thunk, reduxRouterMiddleware];

const initialState = {};

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(
    applyMiddleware(...middleware),
  ),
);
/* eslint-enable */
export default store;
