import React, { useState, useCallback } from 'react';
import {getQuery, updateQuery} from "../../utils/stringHelper";
import moment from "moment";

const useFilter = (props = {}) => {
  const query = getQuery(props);
  const fromInit = query.from ? query.from :
    query.to ? moment(query.to).subtract(1, 'year').toISOString() : moment().subtract(7, 'day').toISOString();
  const toInit = query.to ? query.to :
    query.from ? moment(query.from).add(1, 'year').toISOString() : moment().toISOString();
  const [filter, setFilter] = useState({
    dateRange: query.dateRange || '7days',
    from: fromInit,
    to: toInit,
    sortBy: query.sortBy,
    order: query.order,
    locations: query.locations ? query.locations.split('+') : ['home', 'productDetails', 'productDetailsFeatured', 'cart'],
    sources: query.sources ? query.sources.split('+') : ['similar', 'mostPopular', 'leastPopular', 'custom'],
  });

  const filterChange = useCallback(
    (fields) => {
      const newFilter = filter;
      const query = {};
      Object.keys(fields).forEach((field) => {
        let updateValue = fields[field];
        if (Array.isArray(newFilter[field])) {
          const locationIndex = newFilter[field].findIndex((location) => location === updateValue);
          if (locationIndex >= 0) {
            newFilter[field].splice(locationIndex, 1);
            query[field] = newFilter[field].join('+');
          } else {
            newFilter[field].push(updateValue);
            query[field] = newFilter[field].join('+');
          }
        } else {
          newFilter[field] = updateValue;
          query[field] = updateValue;
        }
      });
      setFilter({ ...filter, newFilter });
      query['p'] = 1;
      updateQuery(props, query);
    }, [filter]);

  return {
    filter,
    filterChange,
  }
};

export default useFilter;
