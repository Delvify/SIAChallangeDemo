import PropTypes from "prop-types";

const ProductProptypes = PropTypes.shape({
  images: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
  })),
  name: PropTypes.string,
  sku: PropTypes.string,
  currencySign: PropTypes.string,
  price: PropTypes.number,
  description: PropTypes.string,
});

export {
  ProductProptypes,
};
