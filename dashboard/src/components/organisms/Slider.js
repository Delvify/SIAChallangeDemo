import React from 'react';
import SliderComponent from "react-slick";
import PropTypes from "prop-types";

const SlickArrow = (props) => {
  const { prev, style, onClick } = props;
  return (
    <div className="slick-arrow position-absolute text-black-50" style={{...style, zIndex: 10, top: '50%', right: prev ? 'auto' : 0, cursor: 'pointer'}} onClick={onClick}>
      <i className={`fa fa-arrow-circle-${prev ? 'left' : 'right'} fa-lg`} />
    </div>
  )
};

const Slider = (props) => {
  const { items, type } = props;
  return (
    <SliderComponent
      slidesToShow={5}
      nextArrow={<SlickArrow />}
      prevArrow={<SlickArrow prev />}
      swipeToSlide={true}
      infinite={false}
    >
      {
        items.map((item) => {
          const countTag = window._.get({
            click: `Clicks: ${item.count.click}`,
            addCart: `Added: ${item.count.addCart}`,
            purchase: `Purchase: ${item.count.purchase}`,
          }, type);
          return (
            <div className="d-flex flex-column align-items-center" key={`type_${item.pid}`}>
              <img className="w-100" src={item.images[0].url} style={{ objectFit: 'contain' }} />
              <div className="text-center m-1">{item.name}</div>
              <div className="h6 p-1">{countTag}</div>
            </div>
          )
        })
      }
    </SliderComponent>
  )
};


Slider.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string,
    })),
    count: PropTypes.shape({
      addCart: PropTypes.number,
      purchase: PropTypes.number,
      click: PropTypes.number,
    }),
  })),
  type: PropTypes.oneOf(['click', 'addCart', 'purchase']),
};

export default Slider;
