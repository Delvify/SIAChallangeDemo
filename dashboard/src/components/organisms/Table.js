import React from 'react';
import {Row, Spinner, Table as TableComponent} from 'reactstrap';
import PropTypes from "prop-types";

const TableBody = (props) => {
  const { items, onRowClick } = props;
  return (
    <tbody className="bg-white">
      {
        items.map((item) => {
          const { id, rowContent, rowStyle = {} } = item;
          return (
            <tr onClick={() => { onRowClick && onRowClick(id); }} key={`item_row_${id}`} style={{ cursor: `${onRowClick ? 'pointer' : 'default'}` }}>
              {
                Object.keys(rowContent).map((key) =>
                  <td key={`item_row_data_${key}`} style={rowStyle[key]}>
                    {rowContent[key]}
                  </td>
                )
              }
            </tr>
          )
        })
      }
    </tbody>
  )
};
const tableBodyPropTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rowContent: PropTypes.object.isRequired,
    rowStyle: PropTypes.object,
  })).isRequired,
  onRowClick: PropTypes.func,
};

TableBody.propTypes = tableBodyPropTypes;

const TableHeader = (props) => {
  const { headers, sortBy, order, onSort, outline } = props;

  return (
    <thead className={!outline ? "thead-light" : ''}>
      <tr>
        {
          headers.map((header) => {
            const { id, sortId, label } = header;
            return (
              <th key={`table_header_${id}`}>
                <span>{label}</span>
                {
                  !!sortId &&
                    <a
                      href="javascript:void(0)"
                      className={`${sortBy === sortId ? 'text-primary' : 'text-secondary'}`}
                      onClick={() => { onSort(sortId) }}
                    >
                      <i
                        className={`fa
                       pl-2
                        pr-2
                         ${sortBy === sortId && order === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc'}
                          ${sortBy === sortId && order === 'desc' ? 'align-top' : 'align-bottom'}`}
                      />
                    </a>
                }
              </th>
            )
          })
        }
      </tr>
    </thead>
  )
};
const tableHeaderProptypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    sortId: PropTypes.string,
  })).isRequired,
  sortBy: PropTypes.string,
  order: PropTypes.oneOf(['desc', 'asc', '']),
  onSort: PropTypes.func,
};
TableHeader.propTypes = tableHeaderProptypes;

const Table = (props) => {
  const { headers, sortBy, order, onSort, items, onRowClick, outline, loading } = props;
  return (
    <TableComponent hover responsive className={!outline ? 'table-outline mb-0 d-none d-sm-table' : ''}>
      <TableHeader headers={headers} sortBy={sortBy} order={order} onSort={onSort} outline={outline} />
      {
        loading ?
          <tbody className="bg-white">
            <tr>
              <td colSpan={headers.length} className="text-center"><Spinner color="info"/></td>
            </tr>
          </tbody> :
          <TableBody items={items} onRowClick={onRowClick} />
      }
    </TableComponent>
  )
};

Table.propTypes = {
  ...tableHeaderProptypes,
  ...tableBodyPropTypes,
  outline: PropTypes.bool,
  loading: PropTypes.bool,
};

export default Table;
