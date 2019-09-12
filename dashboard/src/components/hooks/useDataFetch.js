import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import {engagementCountMapper, itemEngagementMapper} from "../../utils/mappers";
import {getQuery, updateQuery} from "../../utils/stringHelper";

const useDataFetch = (props, url, params, filter, format) => {
  const query = getQuery(props);

  const [data, setData] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(parseInt(query.p) || 1);
  const [loading, setLoading] = useState(false);

  const { from, to, sortBy, order } = filter;

  const goToPage = useCallback((page) => {
    setPage(page);
    updateQuery(props, { p: page });
  }, [props]);

  useEffect(() => {
    goToPage(1);
  }, [filter]);

  const fetchData = useCallback(() => {
    setLoading(true);
    window.api.get(url, { params: {
        limit: window.FETCH_LIMIT,
        offset: window.FETCH_LIMIT * (page - 1),
        from: from,
        to: to,
        sortBy: sortBy,
        order: order,
        ...params,
      }})
      .then((res) => {
        const { total, rows } = res;
        const formattedResult = rows.map(format);
        setTotalPage(Math.max(1, Math.ceil(total / window.FETCH_LIMIT)));
        setData(formattedResult);
        setLoading(false);
      }).catch(() => {
        setTotalPage(1);
        setData([]);
        setLoading(false);
      });
  }, [page, filter]);

  return {
    page,
    goToPage,
    totalPage,
    data,
    fetchData,
    loading,
  }
};

export default useDataFetch;
