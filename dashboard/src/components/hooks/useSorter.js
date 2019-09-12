import React from 'react';

const useSorter = (filter, filterChange) => {

  const sort = (column) =>{
    const { sortBy, order } = filter;
    if (sortBy === column) {
      if (order === 'desc') {
        filterChange({ order: null, sortBy: null });
      } else if (order === 'asc') {
        filterChange({ order: 'desc' });
      } else {
        filterChange({ order: 'asc' });
      }
    } else {
      filterChange({ sortBy: column, order: 'asc' });
    }
  };

  return {
    sort,
  }
};

export default useSorter;
