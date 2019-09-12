import React, { useState, useCallback } from 'react';
import {
  Button,
  ButtonGroup as ButtonGroupComponent,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Form,
  FormGroup, Input,
  InputGroup, InputGroupAddon, InputGroupText, Label,
  Row
} from "reactstrap";
import PropTypes from "prop-types";
import moment from "moment";

const ButtonGroup = (props) => {
  const { onClick, filterAttr, buttons } = props;

  return (
    <ButtonGroupComponent>
      {
        buttons.map((button) => {
          return (
            <Button
              color={button.checked ? 'primary' : 'secondary' }
              active={button.checked}
              onClick={() => { onClick(button.id); }}
              key={`${filterAttr}_${button.id}`}
            >
              {button.label}
            </Button>
          )
        })
      }
    </ButtonGroupComponent>
  );
};

ButtonGroup.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    checked: PropTypes.bool,
  })).isRequired,
  checked: PropTypes.bool,
  filterAttr: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const CheckGroup = (props) => {
  const { options, onChange, filterAttr } = props;

  return (
    options.map(option => (
      <FormGroup check inline key={`${filterAttr}_${option.id}`}>
        <Input
          className="form-check-input"
          type="checkbox"
          id={`${filterAttr}_${option.id}`}
          name={`${filterAttr}_${option.id}`}
          value={`${filterAttr}_${option.id}`}
          checked={option.checked}
          onChange={() => { onChange(option.id); }}
        />
        <Label className="form-check-label" check htmlFor={`${filterAttr}_${option.id}`}>{option.label}</Label>
      </FormGroup>
    ))
  )
};

CheckGroup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    checked: PropTypes.bool,
  })).isRequired,
  filterAttr: PropTypes.string,
  onChange: PropTypes.func,
};


const Filter = (props) => {
  const [filterOpen, setFilterOpen] = useState(true);
  const [changingDate, setChangingDate] = useState(false);
  const [tempDate, setTempDate] = useState({ from: null, to: null });
  const [error, setError] = useState(null);
  const {
    filter,
    filterChange
  } = props;

  const dateRangeButtons = [
    { id: 'yesterday', label: 'Yesterday', checked: filter.dateRange === 'yesterday'},
    { id: 'today', label: 'Today', checked: filter.dateRange === 'today'},
    { id: '7days', label: 'Last 7 Days', checked: filter.dateRange === '7days'},
    { id: '30days', label: 'Last 30 Days', checked: filter.dateRange === '30days'},
  ];

  const locationOptions = [
    { id: 'home', label: 'Home', checked: filter.locations.includes('home') },
    { id: 'productDetails', label: 'Product Details', checked: filter.locations.includes('productDetails') },
    { id: 'productDetailsFeatured', label: 'Product Featured', checked: filter.locations.includes('productDetailsFeatured') },
    { id: 'cart', label: 'Cart', checked: filter.locations.includes('cart') }
  ];

  const recommendationTypeOptions = [
    { id: 'similar', label: 'Similar items', checked: filter.sources.includes('similar') },
    { id: 'mostPopular', label: 'Most popular items', checked: filter.sources.includes('mostPopular') },
    { id: 'leastPopular', label: 'Least popular items', checked: filter.sources.includes('leastPopular') },
    { id: 'custom', label: 'Custom', checked: filter.sources.includes('custom') }
  ];

  const changeDateRange = useCallback((id) => {
    let from, to = null;
    if (id === filter.dateRange) {
      return;
    }
    switch (id) {
      case 'yesterday':
        from = moment().subtract(1, 'day').startOf('day').toISOString();
        to = moment().subtract(1, 'day').endOf('day').toISOString();
        break;
      case 'today':
        from = moment().startOf('day').toISOString();
        to = moment().endOf('day').toISOString();
        break;
      case '7days':
        from = moment().subtract(7, 'day').startOf('day').toISOString();
        to = moment().endOf('day').toISOString();
        break;
      case '30days':
        from = moment().subtract(30, 'day').startOf('day').toISOString();
        to = moment().endOf('day').toISOString();
        break;
      case 'custom':
        to = moment().endOf('day').toISOString();
        switch (filter.groupBy) {
          case 'hour':
            from = moment().subtract(1, 'day').toISOString();
            break;
          case 'day':
            from = moment().subtract(30, 'day').toISOString();
            break;
          case 'week':
            from = moment().subtract(16, 'week').toISOString();
            break;
          case 'month':
            from = moment().subtract(12, 'month').toISOString();
            break;
          case 'year':
            from = moment().subtract(5, 'year').toISOString();
            break;
        }
        break;
    }
    onResetDateChange();
    filterChange({ dateRange: id, from, to });
  }, [filter]);

  const changeDateInput = useCallback(({ from, to }) => {
    const update = {};
    const tempDateUpdate = {};
    let fromMoment = null, toMoment = null;
    if (from) {
      tempDateUpdate.from = from;
      fromMoment = moment(from, 'YYYY-MM-DD');
      toMoment = tempDate.to ? moment(tempDate.to, 'YYYY-MM-DD') : filter.to ? moment(filter.to) : null;
    } else if (to) {
      tempDateUpdate.to = to;
      fromMoment = tempDate.from ? moment(tempDate.from, 'YYYY-MM-DD') : filter.from ? moment(filter.from) : null;
      toMoment = moment(to, 'YYYY-MM-DD');
    }

    if (toMoment && toMoment.diff(fromMoment, 'year', true) > 1) {
      setError('Date range must be less than one year');
    } else if (toMoment && fromMoment.diff(toMoment) > 0) {
      setError('Invalid date range');
    } else {
      setError(null);
    }
    setTempDate(tempDateUpdate);
    setChangingDate(true);
  }, [filter, tempDate]);

  const onApplyDateChange = useCallback(() => {
    const date = {};
    if (tempDate.from) {
      date.from = moment(tempDate.from, 'YYYY-MM-DD').toISOString();
    }
    if (tempDate.to) {
      date.to = moment(tempDate.to, 'YYYY-MM-DD').toISOString();
    }
    filterChange({ dateRange: 'custom', ...date });
    onResetDateChange();
  }, [tempDate]);

  const onResetDateChange = useCallback(() => {
    setChangingDate(false);
    setTempDate({ from: null, to: null});
    setError(null);
  }, []);
  return (
    <Card className="mb-10">
      <CardHeader id="headingOne">
        <Button block color="link" className="text-left m-0 p-0 text-decoration-none" onClick={() => { setFilterOpen(!filterOpen); }} aria-expanded aria-controls="collapseOne">
          <span className="m-0 p-0 font-weight-bold"><i className="fa fa-sliders"/> Filters</span>
        </Button>
      </CardHeader>
      <Collapse isOpen={filterOpen} data-parent="#accordion" id="collapseOne" aria-labelledby="headingOne">
        <CardBody>
          <Form>
            <FormGroup row className="justify-content-center">
              <Row className="no-gutters">
                <ButtonGroup buttons={dateRangeButtons} filterAttr={'dateRange'} onClick={(id) => {changeDateRange(id)}}/>
                  <div className="d-flex flex-row ml-2">
                    <InputGroup className="mr-1">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>From</InputGroupText>
                      </InputGroupAddon>
                      <Input
                        type="date"
                        id="date-input"
                        name="from"
                        placeholder="date"
                        value={tempDate.from ? tempDate.from : moment(filter.from).format('YYYY-MM-DD')}
                        onChange={(e) => {changeDateInput({ from: e.target.value })}}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>To</InputGroupText>
                      </InputGroupAddon>
                      <Input
                        type="date"
                        id="date-input"
                        name="to"
                        placeholder="date"
                        value={tempDate.to ? tempDate.to : moment(filter.to).format('YYYY-MM-DD')}
                        onChange={(e) => {changeDateInput({ to: e.target.value })}}
                      />
                    </InputGroup>
                  </div>
                  {
                    changingDate &&
                      <div className="d-flex flex-row">
                        <Button color="primary" title="Apply" className="mr-2" disabled={!!error} onClick={onApplyDateChange}><i className="fa fa-check fa-lg"/></Button>
                        <Button color="danger" title="Reset" onClick={onResetDateChange}><i className="fa fa-close fa-lg"/></Button>`
                      </div>
                  }
                  { !!error && <div className="text-danger mt-1">{`Error: ${error}`}</div> }
              </Row>
            </FormGroup>
            {
              /*
              <FormGroup row>
                <Col md="2">
                  <span>Widget location</span>
                </Col>
                <Col xs="12" md="10">
                  <CheckGroup options={locationOptions} filterAttr={'locations'} onChange={(id) => {filterChange({ locations: id })}} />
                </Col>
              </FormGroup>
               */
            }
            {
              /*
              <FormGroup row>
                <Col md="2">
                  <span>Recommendation Types</span>
                </Col>
                <Col xs="12" md="10">
                  <CheckGroup options={recommendationTypeOptions} filterAttr={'sources'} onChange={(id) => {filterChange({ sources: id })}} />
                </Col>
              </FormGroup>
               */
            }
          </Form>
        </CardBody>
      </Collapse>
    </Card>
  )
};

Filter.propTypes = {
  filterChange: PropTypes.func.isRequired,
  filter: PropTypes.shape({
    dateRange: PropTypes.string,
    from: PropTypes.string,
    to: PropTypes.string,
    sortBy: PropTypes.string,
    order: PropTypes.string,
    locations: PropTypes.arrayOf(PropTypes.oneOf(['home', 'productDetails', 'productDetailsFeatured', 'cart'])),
    sources: PropTypes.arrayOf(PropTypes.oneOf(['similar', 'mostPopular', 'leastPopular', 'custom'])),
  }).isRequired,
};

Filter.defaultProps = {
  filterChange: () => {},
  filter: {
    dateRange: '',
    from: '',
    to: '',
    sortBy: '',
    order: '',
    locations: [],
    sources: [],
  },
};

export default Filter;
