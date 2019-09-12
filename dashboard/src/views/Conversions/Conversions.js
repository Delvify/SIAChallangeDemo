import React, { useEffect, useCallback, useState } from 'react';
import {Button, Card, CardBody, CardGroup, CardHeader, Progress} from "reactstrap";
import {engagementCountMapper, orderMapper} from '../../utils/mappers';
import moment from "moment-timezone";
import { getCode } from 'country-list';
import {Pagination, Filter, Table, OrderModel} from "../../components/organisms";
import {useDataFetch, useFilter, useSorter} from "../../components/hooks";
import {StatCard} from "../../components/molecules";
import {formatNum} from "../../utils/numberHelper";
import { Parser }  from 'json2csv';
import classNames from "classnames";


const headers = [
  { id: 'orderId', sortId: 'oid', label: 'Order Id' },
  { id: 'geoLocation', sortId: 'geo_location', label: 'Country' },
  { id: 'device', sortId: 'device', label: 'Device' },
  { id: 'itemsCount', sortId: 'items_count', label: 'No. of items' },
  { id: 'totalValue', sortId: 'total_value', label: 'Total value(USD)' },
  { id: 'sales', sortId: 'sales', label: 'Delvify Sales(USD)' },
  { id: 'createdAt', sortId: 'createdAt', label: 'Created date' },
];

const Conversions = (props) => {
  const loading = {};
  const { filter, filterChange } = useFilter(props);
  const { sort } = useSorter(filter, filterChange);
  const { data, totalPage, page, goToPage, fetchData, loading: loadingData } = useDataFetch(props, '/order', {}, filter, (row) => ({ ...orderMapper(row) }));
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState({ items: [] });
  const [overviews, setOverviews] = useState({
    orders: 0,
    orderValue: 0,
    delvifySales: 0,
  });
  const [loadingState, setLoadingState] = useState({});


  const fetchOverviews = useCallback(() => {
    loading['overviews'] = true;
    setLoadingState({...loading});
    const { from, to } = filter;
    window.api.get('order/amount', { params: { from, to } })
      .then((result) => {
        const orders = window._.get(result, ['total', 'quantity'], 0);
        const orderValue = window._.get(result, ['total', 'value'], 0);
        const delvifySales = window._.get(result, ['recommended', 'value'], 0);
        setOverviews({
          orders,
          orderValue: orderValue.toFixed(2),
          delvifySales: delvifySales.toFixed(2),
        });
        loading['overviews'] = false;
        setLoadingState({...loading});
      })
  }, [loading, filter]);

  const onTableRowClick = useCallback((id) => {
    setViewOrder(data.find((datum) => datum.orderId === id));
    toggleModalOpen();
  }, [data]);

  const toggleModalOpen = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const downloadCSV = useCallback(() => {
    loading['download'] = true;
    setLoadingState({...loading});
    const { from, to } = filter;
    window.api.get('order', { params: { from, to } })
      .then((res) => {
        const result = res['rows'].map(orderMapper);
        if (result.length > 0) {
          const fields = Object.keys(result[0]);
          const parser = new Parser({ fields });
          const csv = parser.parse(result);
          const file = new Blob([csv], {type: 'text/plain'});
          const element = document.createElement('a');
          element.href = URL.createObjectURL(file);
          element.download = `Conversions_${moment(from).format('YYYY-MM-DD')}_${moment(to).format('YYYY-MM-DD')}.csv`;
          element.style.display = 'none';
          document.body.appendChild(element); // Required for this to work in FireFox
          element.click();
          document.body.removeChild(element);
        } else {
          alert("No data in this date range.");
        }
        loading['download'] = false;
        setLoadingState({...loading});
      })
  }, [loading, filter]);

  useEffect(() => {
    fetchOverviews();
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [page, filter]);

  const rowItems = data.map((item) => {
    const geoLocation = window._.get(item, 'geoLocation', '');
    const locationIcon = window._.lowerCase(getCode(geoLocation));
    const device = window._.get(item, 'device', '');
    const deviceIcon = window._.get({
      MOBILE: 'smartphone',
      TABLET: 'tablet',
      DESKTOP: 'desktop',
    }, device);
    return ({
      id: item.orderId,
      rowContent: {
        oid: window._.get(item, 'orderId', 0),
        geo_location: <i
          className={`flag-icon flag-icon-${locationIcon} h5`}
          title={geoLocation}/>,
        device: <i
          className={`icon-screen-${deviceIcon} icons font-2xl`}
          title={device}/>,
        itemsCount: window._.get(item, 'itemsCount', 0),
        totalValue: `$${window._.get(item, 'totalValue', 0).toFixed(2)}`,
        sales: <span className='text-success font-weight-bold'>{`$${window._.get(item, 'sales', 0).toFixed(2)}`}</span>,
        createdAt: moment(window._.get(item, 'createdAt', '')).tz(moment.tz.guess()).format('D MMM YYYY hh:mma z'),
      },
    })
  });

  return(

    <div>
      <Filter filterChange={filterChange} filter={filter} />
      <CardGroup className="mb-2">
        <StatCard loading={loadingState.overviews} icon="cui-basket-loaded" color="primary" title={'Total Orders'}>{formatNum(overviews.orders)}</StatCard>
        <StatCard loading={loadingState.overviews} icon="cui-dollar" color="primary" title={'Total Order Value'}>${formatNum(overviews.orderValue)}</StatCard>
        <StatCard loading={loadingState.overviews} icon="cui-dollar" color="primary" title={'Delvify Sales'}>${formatNum(overviews.delvifySales)}</StatCard>
        <StatCard loading={loadingState.download} icon="cui-cloud-download" color="success" onChangeTab={downloadCSV}>Download CSV</StatCard>
      </CardGroup>
      <Table
        loading={loadingData}
        headers={headers}
        items={rowItems}
        sortBy={filter.sortBy}
        order={filter.order}
        onSort={sort}
        onRowClick={onTableRowClick}
      />
      <Pagination page={page} totalPage={totalPage} goToPage={goToPage} />
      <OrderModel order={viewOrder} isOpen={modalOpen} onClose={toggleModalOpen} />
    </div>
  );
}


export default Conversions;
