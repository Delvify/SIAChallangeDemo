import React, { useState, useCallback, useEffect } from 'react';
import {Card, CardBody, Col, Form, Row} from "reactstrap";
import {ProductSearchModal} from "./index";
import {productDetailMapper} from "../../utils/mappers";
import PropTypes from "prop-types";
import {ProductProptypes} from "../../utils/proptypes";

const ItemCard = (props) => {
  const { item, index, getItem, displayProductModal, toggleProductModal, onAddFeatured, onRemoveFeatured } = props;
  const toggleModal = useCallback(() => {
    toggleProductModal(index);
  }, []);
  const onAdd = useCallback((item) => {
    onAddFeatured(index, item);
  }, []);
  const onRemove = useCallback(() => {
    onRemoveFeatured(index);
  }, []);
  return (
    <div>
      <Card style={{ height: '10rem', width: '10rem' }} className="d-flex justify-content-center overflow-hidden">
        <a href="javascript:void(0)" className="text-decoration-none h-100 d-flex justify-content-center" onClick={toggleModal}>
          {
            item && item.images.length > 0 ?
              <img src={item.images[0].url} style={{ objectFit: 'contain'}} /> :
              <CardBody className="text-white bg-secondary d-flex align-items-center flex-column justify-content-center">
                <div className="h1 text-muted">
                  <i className="icon-plus icons" />
                </div>
              </CardBody>
          }
        </a>
      </Card>
      <ProductSearchModal
        getItem={getItem}
        isOpen={displayProductModal}
        onClose={toggleModal}
        onAdd={onAdd}
        onRemove={onRemove}
        item={item}
      />
    </div>
  )
};

const FeaturedSetting = (props) => {

  const { getItem, updateList, items } = props;

  const [displayProductModal, setDisplayProductModal] = useState([false, false, false, false]);
  const [featuredItems, setFeaturedItems] = useState(items || [null, null, null, null]);

  const toggleProductModal = useCallback((index) => {
    setDisplayProductModal(displayProductModal => {
      return window._.clone(window._.fill(displayProductModal, !displayProductModal[index], index, index+1));
    });
  }, [displayProductModal]);

  const onAddFeatured = useCallback((index, item) => {
    setFeaturedItems(featuredItems => {
      return window._.clone(window._.fill(featuredItems, item, index, index+1));
    });
  }, [featuredItems]);

  const onRemoveFeatured = useCallback((index) => {
    setFeaturedItems(featuredItems => {
      return window._.clone(window._.fill(featuredItems, null, index, index+1));
    });
  }, [featuredItems]);

  useEffect(() => {
    updateList(featuredItems);
  }, [featuredItems]);

  useEffect(() => {
    setFeaturedItems(items);
  }, [items]);

  return (
    <Row>
      <Col>
        <Card style={{ height: '10rem', width: '10rem' }}>
          <CardBody className="text-white bg-info d-flex align-items-center flex-column justify-content-center">
            <div className="h1 text-muted">
              <i className="cui-chevron-top icons" />
            </div>
            <div className="h5 text-center">Most popular item</div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card style={{ height: '10rem', width: '10rem' }}>
          <CardBody className="text-white bg-info d-flex align-items-center justify-content-center flex-column">
            <div className="h1 text-muted">
              <i className="cui-chevron-bottom icons" />
            </div>
            <div className="h5 text-center">Least popular item</div>
          </CardBody>
        </Card>
      </Col>
        {
          featuredItems.map((item, index) => {
            return (
              <Col key={`ItemCard_${index}`}>
                <ItemCard
                  item={item}
                  index={index}
                  displayProductModal={displayProductModal[index]}
                  toggleProductModal={toggleProductModal}
                  getItem={getItem}
                  onAddFeatured={onAddFeatured}
                  onRemoveFeatured={onRemoveFeatured}
                />
              </Col>
            )
          })
        }
    </Row>
  )
};

FeaturedSetting.propTypes = {
  getItem: PropTypes.func.isRequired,
  updateList: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(ProductProptypes),
};

FeaturedSetting.defaultProps = {
  getItem: () => {},
  updateList: () => {},
};

export default FeaturedSetting;
