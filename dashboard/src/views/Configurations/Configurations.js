import React, { useCallback, useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Collapse,
  Form,
  FormGroup,
  Input, InputGroup, InputGroupAddon, InputGroupText,
  Label, Modal, ModalBody, ModalFooter, ModalHeader, Popover, PopoverBody,
  Row,
} from 'reactstrap';
import {configMapper, productDetailMapper} from "../../utils/mappers";
import {FeaturedSetting, ProductSearchModal} from "../../components/organisms";
import Spinner from "reactstrap/es/Spinner";
import { SketchPicker } from 'react-color';

import currencyData from '../../assets/data/currency';

const PositionCheckBox = (props) => {
  const { placement, onChange } = props;
  const { location, label, checked, heading, noOfItems } = placement;
  return (
    <div>
      <FormGroup check className="checkbox">
        <Input className="form-check-input" type="checkbox" id={`checkbox_${location}`} name={location} value={location} checked={checked} onChange={() => { onChange(location, { checked: !checked}); }}/>
        <Label check className="form-check-label" htmlFor={`checkbox_${location}`}>{label}</Label>
      </FormGroup>
      <Collapse isOpen={checked}>
        <div className="border rounded p-3 m-3">
          <Row>
            <Col md="9">
              <FormGroup>
                <Label htmlFor="widget_heading">Widget Heading</Label>
                <Input type="text" id="widgetHeading" placeholder="Widget Heading" required value={heading} onChange={(e) => { onChange(location, { heading: e.target.value }) }}/>
              </FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label htmlFor="no_of_items">Number of items</Label>
                <Input type="select" name="no_of_items" id="noOfItems" value={noOfItems} onChange={(e) => { onChange(location, { noOfItems: e.target.value }); }}>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </div>
      </Collapse>
    </div>
  )
};

const Configurations = () => {
  const [placements, setPlacements] = useState({
    HOME: { location: 'HOME', label: 'Home Page', checked: false, heading: 'Featured Items', noOfItems: 5 },
    PRODUCT_DETAILS: { location: 'PRODUCT_DETAILS', label: 'Product Details', checked: false, heading: 'Recommended Items', noOfItems: 5 },
    PRODUCT_DETAILS_FEATURED: { location: 'PRODUCT_DETAILS_FEATURED', label: 'Product Details Featured', checked: false, heading: 'Featured Items', noOfItems: 5 },
    CART: { location: 'CART', label: 'Cart Page', checked: false, heading: 'You may also want...', noOfItems: 5 },
  });
  const [addToCartLabel, setAddToCartLabel] = useState('Add to cart');
  const [onAddToCart, setAddToCart] = useState("");
  const [productRedirection, setProductRedirection] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [changing, setChanging] = useState(false);
  const [themedColor, setThemedColor] = useState("#000");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    getConfig();
  }, []);

  const onPlacementChange = useCallback((location, delta) => {
    setChanging(true);
    const tempPlacements = window._.clone(placements);
    tempPlacements[location] = { ...tempPlacements[location], ...delta };
    setPlacements(tempPlacements);
  }, [placements]);

  const onFeaturedChange = useCallback((featuredItems) => {
    // setChanging(true);
    setFeaturedItems(featuredItems);
  }, []);

  const onAddToCartLabelChange = useCallback((e) => {
    setChanging(true);
    setAddToCartLabel(e.target.value);
  }, []);

  const onAddToCartChange = useCallback((e) => {
    setChanging(true);
    setAddToCart(e.target.value);
  }, []);

  const onProductRedirectionChange = useCallback((e) => {
    setChanging(true);
    setProductRedirection(e.target.value);
  }, []);

  const onCurrencyCodeChange = useCallback((e, index) => {
    setChanging(true);
    const currency = { code: e.target.value, sign: currencyData[e.target.value] };
    const tempCurrencies = window._.clone(currencies);
    if (tempCurrencies[index]) {
      tempCurrencies[index] = currency;
    } else {
      tempCurrencies.push(currency);
    }
    setCurrencies(tempCurrencies);
  }, [currencies]);

  const onCurrencySignChange = useCallback((e, index) => {
    setChanging(true);
    const tempCurrencies = window._.clone(currencies);
    tempCurrencies[index].sign = e.target.value;
    setCurrencies(tempCurrencies);
  }, [currencies]);

  const onAddCurrency = useCallback(() => {
    setChanging(true);
    const tempCurrencies = window._.clone(currencies);
    tempCurrencies.push({ code: 'USD', sign: currencyData['USD'] });
    setCurrencies(tempCurrencies);
  }, [currencies]);

  const onRemoveCurrency = useCallback((e, index) => {
    e.preventDefault();
    setChanging(true);
    const tempCurrencies = window._.clone(currencies);
    tempCurrencies.splice(index, 1);
    setCurrencies(tempCurrencies);
  }, [currencies]);

  const onColorChange = useCallback((e) => {
    setChanging(true);
    setThemedColor(e.target.value);
  }, []);

  const onColorPickerChange = useCallback((color) => {
    setChanging(true);
    setThemedColor(color.hex);
  }, []);

  const toggleColorPicker = useCallback(() => {
    setColorPickerOpen(!colorPickerOpen);
  }, [colorPickerOpen]);

  const getItem = useCallback((productId, sku) => {
    return window.api.get(`product/${productId || ''}`, { params: { sku }})
      .then((res) => {
        const formattedResult = productDetailMapper(res);
        return Promise.resolve(formattedResult);
      });
  }, []);

  const getConfig = useCallback(() => {
    window.api.get('config')
      .then((res) => {
        const config = configMapper(res);
        const tempPlacements = window._.clone(placements);
        window._.get(config, 'placements', []).forEach((placement) => {
          tempPlacements[placement.location] = { ...tempPlacements[placement.location], ...placement, checked: true };
        });
        setPlacements(tempPlacements);
        if (!window._.isEmpty(config.featuredItems)) {
          const tempFeaturedItems = window._.clone(featuredItems);
          const promises = [];
          config.featuredItems.forEach((sku, index) => {
            const promise = getItem(null, sku)
              .then((item) => {
                tempFeaturedItems[index] = item;
              }).catch();
            promises.push(promise);
          });
          Promise.all(promises)
            .then(() => {
              setFeaturedItems(tempFeaturedItems);
            }).catch(console.log);
        }
        setAddToCartLabel(config.addToCartLabel);
        setAddToCart(config.onAddToCart);
        setProductRedirection(config.productRedirection);
        setCurrencies(config.currencies);
        setThemedColor(config.themedColor);
      }).catch(console.log);
  }, []);

  const saveConfig = useCallback(() => {
    setLoading(true);
    const placementsArr = [];
    Object.keys(placements).forEach((key) => {
      const placement = placements[key];
      if (placement.checked) {
        placementsArr.push({
          location: placement.location,
          heading: placement.heading,
          noOfItems: placement.noOfItems,
        });
      }
    });
    window.api.post('config', {
      placements: placementsArr,
      featuredItems: window._.compact(featuredItems).map(item => item.sku),
      addToCartLabel: addToCartLabel,
      onAddToCart: onAddToCart,
      productRedirection: productRedirection,
      currencies: currencies,
      themedColor: themedColor,
    })
      .then(() => {
        setLoading(false);
        setChanging(false);
      }).catch(console.log);
  }, [featuredItems, placements, addToCartLabel, onAddToCart, productRedirection, currencies, themedColor]);

  return (
    <div className="animated fadeIn">
      <Card>
        <CardHeader>
          <strong>Widget Configurations</strong>
        </CardHeader>
        <CardBody>
          <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
            <FormGroup row>
              <Col md="2"><Label>Positions</Label></Col>
              <Col md="8">
                <PositionCheckBox
                  placement={placements.HOME}
                  onChange={onPlacementChange}
                />
                <PositionCheckBox
                  placement={placements.PRODUCT_DETAILS}
                  onChange={onPlacementChange}
                />
                <PositionCheckBox
                  placement={placements.PRODUCT_DETAILS_FEATURED}
                  onChange={onPlacementChange}
                />
                <PositionCheckBox
                  placement={placements.CART}
                  onChange={onPlacementChange}
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="2">
                <Label htmlFor="onAddToCart">Add to cart label</Label>
              </Col>
              <Col md="8">
                <InputGroup className="input-prepend">
                  <Input
                    type="text"
                    name="text-input"
                    id="add-to-cart-label-input"
                    onChange={onAddToCartLabelChange}
                    value={addToCartLabel}
                    placeholder="Add to cart"
                  />
                </InputGroup>
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="2">
                <Label htmlFor="onAddToCart">Product redirection</Label>
              </Col>
              <Col md="8">
                <InputGroup className="input-prepend">
                  <Input
                    type="textarea"
                    name="textarea-input"
                    id="product-redirection-input"
                    rows="9"
                    onChange={onProductRedirectionChange}
                    value={productRedirection}
                    placeholder="function (pid, location, source) { ... }"
                  />
                </InputGroup>
              </Col>
            </FormGroup>

            <FormGroup row>
              <Col md="2">
                <Label htmlFor="onAddToCart">On add to cart</Label>
              </Col>
              <Col md="8">
                <Input
                  type="textarea"
                  name="textarea-input"
                  id="on-add-to-cart-input"
                  rows="9"
                  onChange={onAddToCartChange}
                  value={onAddToCart}
                  placeholder="function(pid) { ... }"
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col md="2">
                <Label htmlFor="onAddToCart">Currencies</Label>
              </Col>
              <Col mad="5">
                {
                  !window._.isEmpty(currencies) &&
                    <Row>
                      <Col md="2">
                        <Label htmlFor="widget_heading">Currency</Label>
                      </Col>
                      <Col md="2">
                        <Label htmlFor="dollarSign">Dollar sign</Label>
                      </Col>
                    </Row>
                }
                {
                  currencies.map((currency, index) => {
                    return (
                      <Row key={`currency_${index}`}>
                        <Col md="2">
                          <FormGroup>
                            <Input type="select" name="currency" id="currency" value={currency.code} onChange={(e) => { onCurrencyCodeChange(e, index); }}>
                              {
                                Object.keys(currencyData).map((code) => {
                                  return <option key={`currency_code_${code}`}>{code}</option>
                                })
                              }
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md="2">
                          <FormGroup>
                            <Input type="text" id="dollarSign" placeholder="$" value={currency.sign} onChange={(e) => { onCurrencySignChange(e, index); }} />
                          </FormGroup>
                        </Col>
                        <Col md="1">
                          <Button onClick={(e) => { onRemoveCurrency(e, index); }}><i className="icon-minus icons" /></Button>
                        </Col>
                      </Row>
                    )
                  })
                }
                <Button color="primary" onClick={onAddCurrency}><i className="icon-plus icons" /> Add Currency</Button>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col md="2">
                <Label htmlFor="themedColor">Themed Color</Label>
              </Col>
              <Col md="8">
                <Row className="align-items-center">
                  <Col md="2"><Input type={'text'} id={'themedColor'} value={themedColor} onChange={onColorChange} /></Col>
                  <Col md="1" className="p-0"><div id="colorTile" onClick={toggleColorPicker} style={{ width: 30, height: 30, borderRadius: 5, backgroundColor: themedColor, cursor: 'pointer' }}/></Col>
                </Row>
                <Popover placement="right" isOpen={colorPickerOpen} target="colorTile" toggle={toggleColorPicker}>
                  <PopoverBody><SketchPicker color={themedColor} onChange={onColorPickerChange} /></PopoverBody>
                </Popover>
              </Col>

            </FormGroup>

            <FormGroup row>
              <Col md="2">
                <Label htmlFor="onAddToCart">Featured Items</Label>
              </Col>
              <Col md="8">
                <FeaturedSetting getItem={getItem} updateList={onFeaturedChange} items={featuredItems}/>
              </Col>
            </FormGroup>
          </Form>
        </CardBody>
        <CardFooter>
          <Button type="submit" size="sm" color="primary" className="float-right" onClick={saveConfig} disabled={!changing || loading}>
            <span>{ loading ? <Spinner color={'white'} size={'sm'} /> : <i className="fa fa-dot-circle-o" /> } Save</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Configurations;
