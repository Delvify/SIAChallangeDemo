import React, { useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Button, CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText, Modal,
  ModalBody, ModalFooter,
  ModalHeader, Row
} from "reactstrap";
import PropTypes from "prop-types";
import {ProductProptypes} from "../../utils/proptypes";

const ProductSearchModal = (props) => {
  const { isOpen, onClose, item, getItem, onAdd, onRemove } = props;
  const [tempItem, setTempItem] = useState(item);
  const [id, setId] = useState(item ? item.productId : null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setId(item ? item.productId : null);
    setTempItem(item);
  }, [isOpen]);

  const onSearch = useCallback(() => {
    setError(null);
    getItem(id)
      .then((res) => {
        setTempItem(res);
      })
      .catch((e) =>{
        setError(e.message);
      });
  }, [id]);

  const onChange = useCallback((val) => {
    setId(val);
  }, []);

  const onConfirm = useCallback(() => {
    onAdd(tempItem);
    onClose();
  }, [tempItem]);

  const onRemoveClick = useCallback(() => {
    onRemove();
    onClose();
  }, []);

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="modal-lg">
      <ModalHeader toggle={onClose}>Search Product</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup row>
            <Col md="12">
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>ProductId</InputGroupText>
                </InputGroupAddon>
                <Input type="text" id="productId" name="productId" placeholder="ProductId" onChange={(e) => { onChange(e.target.value); }} defaultValue={id}/>
                <InputGroupAddon addonType="append">
                  <Button type="button" color="primary" onClick={onSearch} disabled={window._.isEmpty(id)}><i className="fa fa-search"/></Button>
                </InputGroupAddon>
              </InputGroup>
            </Col>
          </FormGroup>
        </Form>
        {
          error ?
            <Alert color="danger">
              { error }
            </Alert> :
            tempItem &&
            <Row>
              <Col sm={3}>
                { tempItem.images.length > 0 && <img src={tempItem.images[0].url} style={{ width: 'inherit' }} /> }
              </Col>
              <Col>
                <div className="font-weight-bold">Product name</div>
                <div>{tempItem.name}</div>
                <div className="font-weight-bold">SKU</div>
                <div>{tempItem.sku}</div>
                <div className="font-weight-bold">Price</div>
                <div>{tempItem.currencySign}{tempItem.price}</div>
                <div className="font-weight-bold">Description</div>
                <div>{tempItem.description}</div>
              </Col>
            </Row>
        }
      </ModalBody>
      <ModalFooter>
        { item && <Button color="danger" onClick={onRemoveClick}>Remove</Button> }
        <Button color="primary" onClick={onConfirm} disabled={!tempItem || tempItem === item}>OK</Button>
      </ModalFooter>
    </Modal>
  )
};

ProductSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: ProductProptypes,
  getItem: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default ProductSearchModal;
