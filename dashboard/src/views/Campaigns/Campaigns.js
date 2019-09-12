import React, { useState, useCallback, useEffect } from 'react';
import { Pagination, Filter, Table } from "../../components/organisms";
import { useDataFetch, useFilter, useSorter } from '../../components/hooks';
import {Button, Card, CardBody, CardHeader, Row, Spinner} from "reactstrap";
import {Bar} from "react-chartjs-2";
import {CustomTooltips} from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import Collapse from "reactstrap/es/Collapse";
import {engagementCountMapper} from "../../utils/mappers";
import {formatNum} from "../../utils/numberHelper";

const locations = {
  HOME: { label: 'Home', index: 0 },
  PRODUCT_DETAILS: { label: 'Product Details', index: 1 },
  PRODUCT_DETAILS_FEATURED: { label: 'Product Details Featured', index: 2 },
  CART: { label: 'Cart', index: 3 }
};
const barInit = {
  labels: Object.keys(locations).map((location) => locations[location].label),
  datasets: [
    {
      label: 'Impressions',
      backgroundColor: 'rgb(77, 189, 116,0.2)',
      borderColor: 'rgb(55,148,87)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgb(77, 189, 116,0.4)',
      hoverBorderColor: 'rgb(55,148,87)',
      data: [],
    },
    {
      label: 'Actions',
      backgroundColor: 'rgb(248, 108, 107,0.2)',
      borderColor: 'rgb(245,48,46)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgb(248, 108, 107,0.4)',
      hoverBorderColor: 'rgb(245,48,46)',
      data: [],
    },
  ],
};

const options = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  scales: {
    xAxes: [{
      stacked: true
    }],
    yAxes: [{
      stacked: true,
      ticks: {
        min: 0,
      },
    }]
  }
};

const headers = [
  { id: 'pid', sortId: 'pid', label: 'ProductId'},
  { id: 'impression', sortId: 'IMPRESSION', label: 'Impressions'},
  { id: 'action', sortId: 'ACTION', label: 'Actions'},
  { id: 'ctr', sortId: 'CTR', label: 'CTR(%)'},
  { id: 'purchase', sortId: 'PURCHASE', label: 'Purchases'},
  { id: 'value', sortId: 'VALUE', label: 'Sales value'},
  { id: 'average', sortId: 'AVERAGE_VALUE', label: 'Average sales value'},
];

const Campaigns = (props) => {
  const loading = {};
  const { filter, filterChange } = useFilter(props);
  const { sort } = useSorter(filter, filterChange);
  const { data, totalPage, page, goToPage, fetchData, loading: loadingData } = useDataFetch(props, '/engagement/item', {}, filter, (row) => ({ pid: row.pid, ...engagementCountMapper(row.count) }));
  const [barOpen, setBarOpen] = useState(true);
  const [bar, setBar] = useState(barInit);
  const [loadingState, setLoadingState] = useState({});

  const fetchCampaign = useCallback(() => {
    const { from, to } = filter;
    loading['campaign'] = true;
    setLoadingState({...loading});
    window.api.get('engagement/count', { params: { groupBy: 'location', from, to } })
      .then((res) => {
        const result = engagementCountMapper(res);
        const bar = window._.clone(barInit);
        const impressions = window._.times(4, () => 0);
        const actions = window._.times(4, () => 0);

        Object.keys(window._.get(result, 'impression', {}))
          .forEach((key) => {
            impressions[window._.get(locations, [key, 'index'], 0)] = window._.get(result, ['impression', key, 'count'], 0);
          });
        Object.keys(window._.get(result, 'action', {}))
          .forEach((key) => {
            actions[window._.get(locations, [key, 'index'], 0)] = window._.get(result, ['action', key, 'count'], 0);
          });

        bar.datasets[0].data = impressions;
        bar.datasets[1].data = actions;
        setBar(bar);
        loading['campaign'] = false;
        setLoadingState({...loading});
      })

  }, [filter]);

  const toggleBarOpen = useCallback(() => {
    setBarOpen(!barOpen);
  }, [barOpen]);

  useEffect(() => {
    fetchData();
    fetchCampaign();
  }, [page, filter]);

  const rowItems = data.map((item) => {
    return ({
      id: item.pid,
      rowContent: {
        pid: window._.get(item, 'pid', 0),
        impression: window._.get(item, 'impression', 0),
        action: window._.get(item, 'action', 0),
        ctr: (window._.get(item, 'ctr', 0) * 100).toFixed(2),
        purchase: window._.get(item, 'purchase', 0),
        value: `$${formatNum(window._.get(item, 'value', 0).toFixed(2))}`,
        average: `$${formatNum(window._.get(item, 'average', 0).toFixed(2))}`,
      },
    })
  });
  return (
    <div>
      <Filter filterChange={filterChange} filter={filter} />
      <Card>
        <CardHeader>
          <Button block color="link" className="text-left m-0 p-0 text-decoration-none" onClick={toggleBarOpen} aria-expanded aria-controls="collapseOne">
            <span className="m-0 p-0 font-weight-bold"><i className={`fa fa-${barOpen ? 'minus' : 'plus'}-square-o`}/> Performance by Campaign</span>
          </Button>
        </CardHeader>
        {
          barOpen &&
            <CardBody>
              {
                loadingState.campaign ?
                  <Row className="justify-content-center"><Spinner color="info"/></Row> :
                  <div className="chart-wrapper">
                    <Bar data={bar} options={options} height={50}/>
                  </div>
              }
            </CardBody>
        }

      </Card>
      <Table
        loading={loadingData}
        headers={headers}
        items={rowItems}
        sortBy={filter.sortBy}
        order={filter.order}
        onSort={sort}
      />
      <Pagination page={page} totalPage={totalPage} goToPage={goToPage} boundaryLinks />
    </div>
  );
};

export default Campaigns;
