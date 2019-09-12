import _ from 'lodash';
import Promise from 'bluebird';
import Api from '../utils/api';
import formulas from '../utils/formulas';
import {overwrite} from "country-list";

const config = () => {
  global._ = _;
  global.api = new Api({});
  global.formulas = formulas;
  global.Promise = Promise;
  Promise.config({
    warnings: false,
    longStackTraces: false,
  });
  global.FETCH_LIMIT = 10;
  overwrite([
    {
      code: 'VN',
      name: 'Vietnam',
    },
    {
      code: "KP",
      name: "North Korea"
    },
    {
      code: "KR",
      name: "South Korea"
    }
  ])
};

export default config();
