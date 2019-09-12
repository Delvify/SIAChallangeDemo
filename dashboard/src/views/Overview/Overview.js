import React, {useCallback, useEffect, useState} from 'react';
import moment from 'moment';
import {Line, Pie} from 'react-chartjs-2';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  CardTitle,
  Col,
  Progress,
  Row,
  Spinner,
} from 'reactstrap';
import {CustomTooltips} from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import {getStyle} from '@coreui/coreui/dist/js/coreui-utilities';
import 'chartjs-plugin-datalabels';

import {engagementCountMapper, productDetailMapper} from '../../utils/mappers';
import {StatCard} from "../../components/molecules";
import {Filter, Map, Slider} from "../../components/organisms";
import {getQuery, updateQuery} from "../../utils/stringHelper";
import {useFilter} from "../../components/hooks";
import {formatNum} from "../../utils/numberHelper";

const brandPrimary = getStyle('--primary');
const brandSuccess = getStyle('--success');
// const brandInfo = getStyle('--info');
const brandWarning = getStyle('--warning');
const brandDanger = getStyle('--danger');

const lineInit = {
  labels: [],
  datasets: [
    {
      label: '',
      borderColor: brandSuccess,
      backgroundColor: 'transparent',
      borderWidth: 2,
      data: [],
    }
  ],
};

const lineOptions = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips,
    intersect: true,
    position: 'nearest',
    callbacks: {
      labelColor: function(tooltipItem, chart) {
        return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
      }
    }
  },
  maintainAspectRatio: false,
  legend: { display: false },

  scales: {
    yAxes: [
      {
        ticks: {
          min: 0,
        },
      }],
  },
};

const pieInit = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
      ],
      hoverBackgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
      ],
    }],
};

const pieOptions = {
  plugins: {
    datalabels: {
      formatter: (value, ctx) => {
        let sum = 0;
        let dataArr = ctx.chart.data.datasets[0].data;
        dataArr.map(data => {
          sum += data;
        });
        let percentage = (value*100 / sum).toFixed(2)+"%";
        return percentage;
      },
      color: '#fff',
    }
  }
};

const Overview = (props) => {
    const loading = {};
    const [overviews, setOverviews] = useState({
      impressions: 0,
      actions: 0,
      ctr: 0,
      orders: 0,
      orderValue: 0,
      averageOrderValue: 0,
    });
    const [activeTab, setActiveTab] = useState(getQuery(props)['t'] || 'impressions');
    const [line, setLine] = useState(lineInit);
    const [groupBy, setGroupBy] = useState(getQuery(props)['groupBy'] || 'day');
    const [display, setDisplay] = useState({ start: moment().toISOString(), end: moment().toISOString() });
    const [pie, setPie] = useState(pieInit);
    const [map, setMap] = useState({});
    const [top10Countries, setTop10Countries] = useState([]);
    const [orderValue, setOrderValue] = useState({ total: {}, recommended: {}, notRecommended: {} });
    const [top10Viewed, setTopTenViewed] = useState([]);
    const [top10Added, setTopTenAdded] = useState([]);
    const [top10Purchased, setTopTenPurchased] = useState([]);
    const [loadingState, setLoadingState] = useState({});

    const { filter, filterChange } = useFilter(props);

    const changeActiveTab = useCallback((tab) => {
      updateQuery(props, { t: tab });
      setActiveTab(tab);
    }, []);

    const fetchOverviews = useCallback(() => {
      loading['overviews'] = true;
      setLoadingState({...loading});
      const { from, to } = filter;
      window.api.get('engagement/count', { params: { from, to } })
        .then((res) => {
          const result = engagementCountMapper(res);

          const impressions = window._.get(result, ['widgetImpression', 'count'], 0);
          const actions = window._.get(result, ['action', 'count'], 0);
          const clicks = window._.get(result, ['click', 'count'], 0);
          const orders = window._.get(result, ['purchase', 'order'], 0);
          const orderValue = window._.get(result, ['purchase', 'value'], 0);
          setOverviews({
            impressions,
            actions,
            ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
            orders,
            orderValue: orderValue.toFixed(2),
            averageOrderValue: orders > 0 ? (orderValue / orders).toFixed(2) : 0,
          });
          loading['overviews'] = false;
          setLoadingState({...loading});
        })
    }, [loading, filter]);

    const fetchBreakdown = useCallback(() => {
      loading['breakdown'] = true;
      setLoadingState({...loading});

      const { from, to } = filter;
      let end, start, tag = null;
      let counter = 0;
      let labels = [], data = [], keys = [];
      switch (groupBy) {
        case 'hour':
          end = to ? moment(to).endOf('day').toISOString() : moment().endOf('hour').toISOString();
          start = from ? moment(from).startOf('day').toISOString() : moment(end).subtract(1, 'day').toISOString();
          tag = moment(start);
          while (tag.diff(moment(end)) <= 0 || tag.startOf('hour').diff(moment(end)) <= 0) {
            keys.push(tag.format('H D M YYYY'));
            labels.push(tag.format('(D/M) ha'));
            tag = tag.add(1, 'hour');
            counter++;
          }
          break;
        case 'day':
          end = to ? moment(to).endOf('day').toISOString() : moment().endOf('day').toISOString();
          start = from ? moment(from).startOf('day').toISOString() : moment(end).subtract(30, 'day').toISOString();
          tag = moment(start);
          while (tag.diff(moment(end)) <= 0 || tag.startOf('day').diff(moment(end)) <= 0) {
            keys.push(tag.format('D M YYYY'));
            labels.push(tag.format('D MMM'));
            tag = tag.add(1, 'day');
            counter++;
          }
          break;
        case 'week':
          end = to ? moment(to).endOf('day').toISOString() : moment().endOf('day').toISOString();
          start = from ? moment(from).startOf('day').toISOString() : moment(end).subtract(16, 'week').toISOString();
          tag = moment(start);
          while (tag.diff(moment(end)) <= 0 || tag.startOf('week').diff(moment(end)) <= 0) {
            keys.push(tag.format('w YYYY'));
            labels.push(`${tag.startOf('week').format('D MMM')} - ${tag.endOf('week').format('D MMM')}`);
            tag = tag.add(1, 'week');
            counter++;
          }
          break;
        case 'month':
          end = to ? moment(to).endOf('day').toISOString() : moment().endOf('day').toISOString();
          start = from ? moment(from).startOf('day').toISOString() : moment(end).subtract(12, 'month').toISOString();
          tag = moment(start);
          while (tag.diff(moment(end)) <= 0 || tag.startOf('month').diff(moment(end)) <= 0) {
            keys.push(tag.format('M YYYY'));
            labels.push(tag.format('MMM YYYY'));
            tag = tag.add(1, 'month');
            counter++;
          }
          break;
        case 'year':
          end = to ? moment(to).endOf('day').toISOString() : moment().endOf('day').toISOString();
          start = from ? moment(from).startOf('day').toISOString() : moment(end).subtract(5, 'year').toISOString();
          tag = moment(start);
          while (tag.diff(moment(end)) <= 0 || tag.startOf('year').diff(moment(end)) <= 0) {
            keys.push(tag.format('YYYY'));
            labels.push(tag.format('YYYY'));
            tag = tag.add(1, 'year');
            counter++;
          }
          break;
      }
      data = window._.times(counter, () => 0);
      setDisplay({ start, end });
      window.api.get('engagement/count', { params: { groupBy, from: start, to: end } })
        .then((res) => {
          const result = engagementCountMapper(res);
          const line = window._.clone(lineInit);
          line.labels = labels;
          const impressions = window._.get(result, activeTab === 'impressions' ? 'widgetImpression' : 'action', {});
          Object.keys(impressions).forEach((key) => {
            const index = keys.findIndex((k) => k === key);
            if (index > -1) {
              data[index] = impressions[key]['count'];
            }
          });
          line.datasets[0].data = data;
          line.datasets[0].label = activeTab === 'impressions' ? 'Impressions' : 'Actions';
          line.datasets[0].borderColor = activeTab === 'impressions' ? brandSuccess : brandDanger;
          setLine(line);
          loading['breakdown'] = false;
          setLoadingState({...loading});
        });
    }, [groupBy, activeTab, filter]);

    const fetchDevice = useCallback(() => {
      const { from, to } = filter;
      loading['device'] = true;
      setLoadingState({...loading});
      window.api.get('engagement/count', { params: { groupBy: 'device', from, to }})
        .then((res) => {
          const result = engagementCountMapper(res);
          const labels = Object.keys(window._.get(result, ['purchase'], {}));
          const count = labels.map((label) => window._.get(result, ['purchase', label, 'order'], 0));
          const pie = window._.clone(pieInit);
          pie.labels = labels;
          pie.datasets[0].data = count;
          setPie(pie);
          loading['device'] = false;
          setLoadingState({...loading});
        })
    }, [filter]);

    const fetchGeo = useCallback(() => {
      loading['map'] = true;
      setLoadingState({...loading});
      const { from, to } = filter;
      window.api.get('engagement/count', { params: { groupBy: 'geo_location', from, to }})
        .then((res) => {
          const result = engagementCountMapper(res);
          const purchase = window._.get(result, ['purchase'], {});
          const sortedPurchase = window._.take(
              window._.map(
                window._.keys(purchase),
                (key) => ({ name: key, order: purchase[key].order, value: purchase[key].value })
              ).sort((a, b) => b.order - a.order),
            10);
          setMap(purchase);
          setTop10Countries(sortedPurchase);
          loading['map'] = false;
          setLoadingState({...loading});
        })
    }, [filter]);

    const fetchOrderValue = useCallback(() => {
      loading['orderValue'] = true;
      setLoadingState({...loading});
      const { from, to } = filter;
      window.api.get('order/amount', { params: { from, to }})
        .then((res) => {
          setOrderValue(res);
          loading['orderValue'] = false;
          setLoadingState({...loading});
        });
    }, [filter]);

    const fetchRank = useCallback((sortBy) => {
      loading['rank'] = true;
      setLoadingState({...loading});
      const { from, to } = filter;
      window.api.get('engagement/item', { params: { from, to, limit: 10, offset: 0, sortBy, order: 'desc' }})
        .then((res) => {
          const promises = [];
          const result = res.rows.map((row) => ({
            pid: row.pid,
            count: engagementCountMapper(row.count)
          }));
          result.forEach((item) => {
            promises.push(window.api.get('product', { params: { sku: item.pid }})
              .then((res) => {
                const formattedResult = productDetailMapper(res);
                return Promise.resolve({ ...item, ...formattedResult });
              }))
          });
          Promise.all(promises)
            .then((res) => {
              switch (sortBy) {
                case 'CLICK':
                  setTopTenViewed(res); break;
                case 'ADD_CART':
                  setTopTenAdded(res); break;
                case 'PURCHASE':
                  setTopTenPurchased(res); break;
              }
              loading['rank'] = false;
              setLoadingState({...loading});
            });
        });
    }, [filter]);

    const changeGroupBy = useCallback((groupBy) => {
      setGroupBy(groupBy);
      updateQuery(props, { groupBy });
    }, []);

    useEffect(() => {
      fetchOverviews();
      fetchDevice();
      fetchGeo();
      fetchOrderValue();
      fetchRank('CLICK');
      fetchRank('ADD_CART');
      fetchRank('PURCHASE');
    }, [filter]);

    useEffect(() => {
      fetchBreakdown();
    }, [groupBy, activeTab, filter]);

    return (
      <div className="animated fadeIn">
        <Filter filterChange={filterChange} filter={filter} />
        <CardGroup className="mb-2">
          <StatCard loading={loadingState.overviews} icon="icon-bell" color="success" title={'Impressions'} id={'impressions'} activeTab={activeTab} onChangeTab={changeActiveTab}>{formatNum(overviews.impressions)}</StatCard>
          <StatCard loading={loadingState.overviews} icon="icon-fire" color="danger" title={'Actions'} id={'actions'} activeTab={activeTab} onChangeTab={changeActiveTab}>{formatNum(overviews.actions)}</StatCard>
          <StatCard loading={loadingState.overviews} icon="cui-pie-chart" color="primary" title={'CTR'}>{overviews.ctr}%</StatCard>
          <StatCard loading={loadingState.overviews} icon="cui-basket-loaded" color="primary" title={'Orders made'}>{formatNum(overviews.orders)}</StatCard>
          <StatCard loading={loadingState.overviews} icon="cui-dollar" color="primary" title={'Sales value'}>${formatNum(overviews.orderValue)}</StatCard>
          <StatCard loading={loadingState.overviews} icon="cui-dollar" color="primary" title={'Average sales value'}>${formatNum(overviews.averageOrderValue)}</StatCard>
        </CardGroup>
        <Card>
          <CardBody>
            <Row>
              <Col sm="5">
                <CardTitle className="mb-0">{activeTab === 'impressions' ? 'Impressions' : 'Actions'}</CardTitle>
              </Col>
              <Col sm="7" className="d-none d-sm-inline-block">
                <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
                  <ButtonGroup className="mr-3" aria-label="First group">
                    <Button disabled={loadingState.breakdown} color="outline-secondary" active={groupBy === 'hour'} onClick={() => {changeGroupBy('hour');}}>Hourly</Button>
                    <Button disabled={loadingState.breakdown} color="outline-secondary" active={groupBy === 'day'} onClick={() => {changeGroupBy('day');}}>Daily</Button>
                    <Button disabled={loadingState.breakdown} color="outline-secondary" active={groupBy === 'week'} onClick={() => {changeGroupBy('week');}}>Weekly</Button>
                    <Button disabled={loadingState.breakdown} color="outline-secondary" active={groupBy === 'month'} onClick={() => {changeGroupBy('month');}}>Monthly</Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </Col>
            </Row>
            {
                loadingState.breakdown ?
                  <Row className="justify-content-center"><Spinner color="info"/></Row> :
                  <div className="chart-wrapper flex-grow-1" style={{ height: 300 + 'px', marginTop: 40 + 'px' }}>
                    <Line data={line} options={lineOptions} height={300} />
                  </div>
            }
          </CardBody>
        </Card>

        <Row className="no-gutters">
          <Col sm={7} className="d-flex">
            <Card className="mr-1 flex-grow-1">
              <CardHeader>Conversions by Device Type</CardHeader>
              <CardBody>
                {
                  loadingState.device ?
                    <Row className="justify-content-center"><Spinner color="info"/></Row> :
                    <div className="chart-wrapper">
                      <Pie data={pie} options={pieOptions}/>
                    </div>
                }
              </CardBody>
            </Card>
          </Col>
          <Col className="d-flex">
            <Card className="mr-1 flex-grow-1">
              <CardHeader>Comparison</CardHeader>
              <CardBody>
                {
                  loadingState.orderValue ?
                    <Row className="justify-content-center"><Spinner color="info"/></Row> :
                    <div>
                      <div className="text-center h6">Average Sales Value</div>
                      <Row className="align-items-center">
                        <Col sm={2} className="text-right">
                          <span>{`$${formatNum(orderValue.recommended.average ? (orderValue.recommended.average).toFixed(2) : 0)}`}</span>
                        </Col>
                        <Col>
                          <Row className="no-gutters">
                            <Progress className="progress-xs flex-grow-1 mr-1 mr-1 flex-row-reverse" color="info" value={Math.max(orderValue.recommended.average, orderValue.notRecommended.average) > 0 ? orderValue.recommended.average * 100 / Math.max(orderValue.recommended.average, orderValue.notRecommended.average) : 0} />
                            <Progress className="progress-xs flex-grow-1 mr-1 mr-1" color="gray-600" value={Math.max(orderValue.recommended.average, orderValue.notRecommended.average) > 0 ? orderValue.notRecommended.average * 100 / Math.max(orderValue.recommended.average, orderValue.notRecommended.average) : 0} />
                          </Row>
                        </Col>
                        <Col sm={2}>
                          <span>{`$${formatNum(orderValue.notRecommended.average ? (orderValue.notRecommended.average).toFixed(2) : 0)}`}</span>
                        </Col>
                      </Row>
                      <div className="text-center h6 mt-3">Number of products ordered </div>
                      <Row className="align-items-center">
                        <Col sm={2} className="sm-1 text-right">
                          <span>{`${formatNum(orderValue.recommended.quantity ? orderValue.recommended.quantity : 0)}`}</span>
                        </Col>
                        <Col>
                          <Row className="no-gutters">
                            <Progress className="progress-xs flex-grow-1 mr-1 mr-1 flex-row-reverse" color="info" value={orderValue.total.quantity > 0 ? orderValue.recommended.quantity * 100 / orderValue.total.quantity : 0} />
                            <Progress className="progress-xs flex-grow-1 mr-1 mr-1" color="gray-600" value={orderValue.total.quantity > 0 ? orderValue.notRecommended.quantity * 100 / orderValue.total.quantity : 0} />
                          </Row>
                        </Col>
                        <Col sm={2}>
                          <span>{`${formatNum(orderValue.notRecommended.quantity ? orderValue.notRecommended.quantity : 0)}`}</span>
                        </Col>
                      </Row>
                    </div>
                }
                <div className='float-right mt-4'>
                  <Row className='mt-2 align-items-center no-gutters'><div style={{ width: '10px', height: '10px' }} className='bg-info mr-2'/>Clicked devify recommendation</Row>
                  <Row className='mt-2 align-items-center no-gutters'><div style={{ width: '10px', height: '10px' }} className='bg-gray-600 mr-2'/>Did not click devify recommendation</Row>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <CardHeader>Most viewed items</CardHeader>
              <CardBody>
                {
                  loadingState.rank ?
                    <Row className="justify-content-center"><Spinner color="info"/></Row> :
                    <Slider items={top10Viewed} type={'click'} />
                }
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <CardHeader>Most added items</CardHeader>
              <CardBody>
                {
                  loadingState.rank ?
                    <Row className="justify-content-center"><Spinner color="info"/></Row> :
                    <Slider items={top10Added} type={'addCart'} />
                }
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card>
              <CardHeader>Top Selling</CardHeader>
              <CardBody>
                {
                  loadingState.rank ?
                    <Row className="justify-content-center"><Spinner color="info"/></Row> :
                    <Slider items={top10Purchased} type={'purchase'} />
                }
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Card>
          <CardHeader>Conversion Map</CardHeader>
          <CardBody>
            {
              loadingState.map ?
                <Row className="justify-content-center"><Spinner color="info"/></Row> :
                <Map map={map} top10Countries={top10Countries} />
            }
          </CardBody>
        </Card>
      </div>
    );
};

export default Overview;
