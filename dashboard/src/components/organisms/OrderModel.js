import React, { useState, useCallback, useEffect } from 'react';
import {
  Badge,
  Col,
  Modal,
  ModalBody,
  ModalHeader, Row, Table as TableComponent
} from "reactstrap";
import PropTypes from "prop-types";
import {ProductProptypes} from "../../utils/proptypes";
import {Table} from '../organisms';
import {getCode} from "country-list";
import {productDetailMapper} from "../../utils/mappers";
import moment from "moment-timezone";

const headers = [
  { id: 'thumbnail', label: '' },
  { id: 'pid', label: 'ProductId' },
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price(USD)' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'totalValue', label: 'Total Value(USD)' },
  { id: 'currency', label: 'Currency' },
  { id: 'exchangeRate', label: 'Exchange rate' },
  { id: 'recommended', label: 'Recommended?' },
];

const OrderModel = (props) => {
  const { isOpen, onClose, order } = props;
  const { orderId, device, geoLocation, items, itemsCount, totalValue, createdAt, sales } = order;
  const [itemDetails, setItemDetails] = useState([]);

  const geoLocationName = window._.get(order, 'geoLocation', '');
  const locationIcon = window._.lowerCase(getCode(geoLocationName));
  const deviceName = window._.get(order, 'device', '');
  const deviceIcon = window._.get({
    MOBILE: 'smartphone',
    TABLET: 'tablet',
    DESKTOP: 'desktop',
  }, deviceName);

  const fetchItems = useCallback(() => {
    const promises = [];
    items.forEach((item) => {
      promises.push(window.api.get('product', { params: { sku: item.pid }})
        .then((res) => {
          const formattedResult = productDetailMapper(res);
          return Promise.resolve({ ...{
            rrRate: item.exchangeRate,
            rrPrice: item.price,
            rrQuantity: item.quantity,
            rrPid: item.pid,
            rrCurrency: item.currency,
            rrIsRecommended: item.isRecommended || false,
          }, ...formattedResult });
        }))
    });
    Promise.all(promises)
      .then((res) => {
        setItemDetails(res);
      })
  }, [order]);

  useEffect(() => {
    fetchItems();
  }, [order]);


  const rowItems = itemDetails.map((details) => {
    const { images, productId, name, rrPrice, rrCurrency, rrRate, rrQuantity, rrIsRecommended } = details;
    const thumbnail = window._.get(images, [0, 'url'], '');
    return ({
      id: productId,
      rowContent: {
        thumbnail: <img className="w-100" src={thumbnail} style={{objectFit: 'contain'}}/>,
        pid: productId,
        name: name,
        price: `$${(rrPrice || 0).toFixed(2)}`,
        quantity: rrQuantity,
        totalValue: `$${(rrPrice * rrQuantity).toFixed(2)}`,
        currency: rrCurrency,
        exchangeRate: rrRate,
        recommended: rrIsRecommended ? <i className='fa fa-check-square fa-lg text-success' title={'Recommended'}/> : null,
      },
      rowStyle: {
        thumbnail: { width: '100px' },
        name: { width: '200px'},
      },
    })
  });

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="modal-xl">
      <ModalHeader toggle={onClose}>Order Detail</ModalHeader>
      <div className="pl-4 pr-4 pt-4 h6">
        <Row className="no-gutters mb-1"><Col sm={2}>Order Id: </Col><Col>{orderId}</Col></Row>
        <Row className="no-gutters mb-1"><Col sm={2}>Location: </Col><Col>
          <i className={`flag-icon flag-icon-${locationIcon} h6 mb-0`} title={geoLocation}/> {geoLocationName}
        </Col></Row>
        <Row className="no-gutters mb-1"><Col sm={2}>Device: </Col><Col>
          <i className={`icon-screen-${deviceIcon} icons`} title={device}/> {deviceName}
        </Col></Row>
        <Row className="no-gutters mb-1"><Col sm={2}>No. of items: </Col><Col>{itemsCount}</Col></Row>
        <Row className="no-gutters mb-1"><Col sm={2}>Total value: </Col><Col>USD {(totalValue || 0).toFixed(2)}</Col></Row>
        <Row className="no-gutters mb-1 text-success font-weight-bold"><Col sm={2}>Sales made: </Col><Col>USD {(sales || 0).toFixed(2)}</Col></Row>
        <Row className="no-gutters mb-1"><Col sm={2}>Created date: </Col><Col>{moment(createdAt).tz(moment.tz.guess()).format('D MMM YYYY hh:mma z')}</Col></Row>
      </div>
      <ModalBody>
        <Table
          headers={headers}
          items={rowItems}
          outline
        />
      </ModalBody>
    </Modal>
  )
};

OrderModel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    orderId: PropTypes.string,
    device: PropTypes.string,
    geoLocation: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      pid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      price: PropTypes.number,
      currency: PropTypes.string,
      exchangeRate: PropTypes.number,
      quantity: PropTypes.number,
      isRecommended: PropTypes.bool,
    })),
    itemsCount: PropTypes.number,
    totalValue: PropTypes.number,
    createdAt: PropTypes.string,
    sales: PropTypes.number,
  })
};

OrderModel.defaultProps = {
  isOpen: false,
  order: {
    items: [],
  }
};

export default OrderModel;
