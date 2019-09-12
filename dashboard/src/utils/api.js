import { stringify } from 'qs';
import _ from 'lodash';
import moment from 'moment-timezone';
import store from '../store';
import { push } from 'react-router-redux';

const API_HOST = process.env.REACT_APP_API_HOST;

export const checkStatus = response => new Promise((resolve, reject) => {
  if (response.ok) return resolve(response);
  console.log(response);
  response.json()
    .then((jsonError) => {
      console.log(jsonError);
      const error = new Error(_.get(jsonError, 'message', 'Unknown error'));
      error.response = jsonError;
      error.status = response.status;
      reject(error);
    })
    .catch((e) => {
      console.log(e);
      const error = new Error(`${response.status} ${response.statusText}`);
      error.response = response;
      error.status = response.status;
      reject(error);
    });
});

export const getParsedSettings = ({
    method = 'get',
    data,
    ...otherSettings
  } = {}) => {

  const headers = {
    Accept: 'application/json',
    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
    'timezone': moment.tz.guess(),
    'Authorization': `Bearer ${_.get(store.getState(), 'auth.token', {})}`,
    'merchantid': `${_.get(store.getState(), ['auth', 'admin', 'merchantid'], '')}`,
  };

  const settings = _.merge({
    body: data ? data instanceof FormData ? data : JSON.stringify(data) : undefined,
    method: _.toUpper(method),
    headers,
  }, otherSettings);

  return settings;
};

export const parseEndpoint = (endpoint, params) => {
  const strippedEndpoint = endpoint.indexOf('/') === 0 ? endpoint.slice(1) : endpoint;
  const url = endpoint.indexOf('http') === 0 ? endpoint : `${API_HOST}/${strippedEndpoint}`;
  const querystring = params ? `?${stringify(params)}` : '';
  return `${url}${querystring}`;
};

const defaultSettings = {};
class Api {
  constructor(settings) {
    this.defaultSettings = _.merge({}, defaultSettings, settings);
  }

  request(
    endpoint,
    {
      params = {},
      verbose = false,
      ...passedSettings
    } = {},
  ) {
    const settings = _.merge(
      {},
      this.defaultSettings,
      passedSettings,
    );
    const parsedEndpoint = parseEndpoint(endpoint, params);
    const parsedSettings = getParsedSettings(settings);
    return fetch(parsedEndpoint, parsedSettings)
      .then(checkStatus)
      .then(r => {
        if (verbose) {
          return r.json()
            .then(jsonResponse => {
              return {
                statusCode: r.status,
                response: jsonResponse,
              };
            });
        }
        return r.json();
      })
      .then((r) => {
        console.log('%c Successful Api call', 'background: blue; color: white');
        console.log(parsedEndpoint);
        console.log(parsedSettings);
        console.log(r);
        return r;
      })
      .catch((e) => {
        console.log('%c Fail Api call', 'background: red; color: white');
        console.log(parsedEndpoint);
        console.log(parsedSettings);
        console.log(e);
        if (e.status === 401) {   //Unauthorized
          store.dispatch(push('/login'));
        }
        throw e;
      });
  }

  post(endpoint, data, settings) {
    return this.request(endpoint, { method: 'post', data, ...settings });
  }

  get(endpoint, settings) {
    return this.request(endpoint, { method: 'get', ...settings });
  }

  put(endpoint, data, settings) {
    return this.request(endpoint, { method: 'put', data, ...settings });
  }

  patch(endpoint, data, settings) {
    return this.request(endpoint, { method: 'patch', data, ...settings });
  }

  delete(endpoint, data, settings) {
    return this.request(endpoint, { method: 'delete', data, ...settings });
  }
}

export default Api;
