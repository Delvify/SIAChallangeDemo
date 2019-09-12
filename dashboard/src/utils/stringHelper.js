import queryString from "querystring";

const updateQuery = (props, newQuery) => {
  const path = props.location.pathname;
  let query = queryString.parse(props.location.search.substring(1));
  query = { ...query, ...newQuery};
  const qs = queryString.stringify(query);
  props.history.push(`${path}?${qs}`);
};

const getQuery = (props) => {
  const query = queryString.parse(props.location.search.substring(1));
  return query;
}

export {
  updateQuery,
  getQuery,
}
