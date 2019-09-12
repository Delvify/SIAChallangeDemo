import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from "prop-types";
import {hexToRgba} from "@coreui/coreui/dist/js/coreui-utilities";
import {Button, ButtonGroup, ButtonToolbar, CardBody, Collapse, Tooltip} from "reactstrap";
import {ComposableMap, Geographies, Geography, ZoomableGroup} from "react-simple-maps";
import {scaleLinear} from "d3-scale";
import {formatNum} from "../../utils/numberHelper";

const topoMap = require('../../assets/data/topo.json');

const wrapperStyles = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};
const Map = (props) => {
  const { top10Countries, map } = props;
  const [mapTooltipOpen, setMapTooltipOpen] = useState(false);
  const [mapId, setMapId] = useState(0);
  const [countries, setCountries] = useState({});
  const [zoom, setZoom] = useState(0.25);
  const [topCountriesOpen, setTopCountriesOpen] = useState(true);
  const popScale = scaleLinear()
    .domain([0, window._.get(top10Countries, [0, 'order'], 0)])
    .range(["#CFD8DC", "#20a8d8"]);

  const handleZoomIn = useCallback(() => {
    setZoom(zoom * 2);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(zoom / 2);
  }, [zoom]);

  const toggleMapTooltip = useCallback(() => {
    setMapTooltipOpen(!mapTooltipOpen);
  }, [mapTooltipOpen]);

  useEffect(() => {
    if (mapId !== 0) {
      toggleMapTooltip();
    }
  }, [mapId]);

  return (
    <div>
      <div className="position-absolute mr-auto">
        <div className="d-flex flex-column">
          <div style={{cursor: 'pointer', backgroundColor: hexToRgba('#bbbbbb', 80)}} color="link"
               className="text-left p-2 text-decoration-none flex-grow-1" onClick={() => {
            setTopCountriesOpen(!topCountriesOpen);
          }} aria-expanded aria-controls="collapseOne">
            <span className="m-0 p-0"><i className={`fa fa-${topCountriesOpen ? 'minus' : 'plus'}-square-o`}/> Top Countries</span>
          </div>
          <Collapse isOpen={topCountriesOpen}>
            <div className="p-1" style={{backgroundColor: hexToRgba('#ffffff', 80)}}>
              <div style={{textAlign: 'right'}}>Orders</div>
              <div>
                {
                  window._.map(top10Countries, (country) =>
                    <div className="d-flex align-items-center" key={country.name}>
                      <div style={{width: 10, height: 10, backgroundColor: popScale(country.order, 0)}}/>
                      <span className="ml-1 flex-grow-1">{country.name}</span>
                      <span className="ml-3 mr-2">{formatNum(country.order)}</span>
                    </div>
                  )
                }
              </div>
            </div>
          </Collapse>
        </div>
      </div>
      <div className="d-sm-inline-block position-absolute" style={{right: 0}}>
        <ButtonToolbar className="float-right">
          <ButtonGroup className="mr-3">
            <Button style={{backgroundColor: hexToRgba('#ffffff', 80)}} color="outline-secondary"
                    onClick={handleZoomIn}><i className="fa fa-plus"/></Button>
            <Button style={{backgroundColor: hexToRgba('#ffffff', 80)}} block color="outline-secondary"
                    onClick={handleZoomOut}><i className="fa fa-minus"/></Button>
          </ButtonGroup>
        </ButtonToolbar>
      </div>
      <div style={wrapperStyles}>
        <ComposableMap
          projectionConfig={{
            scale: 1000,
            rotation: [-11, 0, 0],
          }}
          width={980}
          height={551}
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <ZoomableGroup center={[0, 20]} zoom={zoom}>
            <Geographies geography={topoMap}>
              {(geographies, projection) => {
                const countries = {};
                const geography = geographies.map((geography, i) => {
                  countries[i] = geography.properties.NAME;
                  return <Geography
                    id={`country_${i}`}
                    key={i}
                    geography={geography}
                    projection={projection}
                    style={{
                      default: {
                        fill: popScale(window._.get(map, [geography.properties.NAME, 'order'], 0)),
                        stroke: "#607D8B",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                      hover: {
                        fill: "#2d4f62",
                        stroke: "#607D8B",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                      pressed: {
                        fill: "#263238",
                        stroke: "#607D8B",
                        strokeWidth: 0.75,
                        outline: "none",
                      }
                    }}
                    onClick={() => {
                      setMapId(i);
                    }}
                  />
                });
                setCountries(countries);
                return geography;
              }}
            </Geographies>

            <div id={'country_0'}/>
            <Tooltip placement="right" isOpen={mapTooltipOpen} target={`country_${mapId}`}
                     toggle={toggleMapTooltip}>
              <div className="d-flex flex-column align-items-start">
                <div className="d-flex align-items-center">
                  <div style={{
                    width: 10,
                    height: 10,
                    backgroundColor: popScale(window._.get(map, [countries[mapId], 'order'], 0))
                  }}/>
                  <span className="ml-1">{countries[mapId]}</span>
                </div>
                <div><span>{`Orders: ${formatNum(window._.get(map, [countries[mapId], 'order'], 0))}`}</span></div>
                <div><span>{`Sales value: $${formatNum(window._.get(map, [countries[mapId], 'value'], 0).toFixed(2))}`}</span></div>
              </div>
            </Tooltip>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  )
};


Map.propTypes = {
  top10Countries: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    order: PropTypes.number,
    value: PropTypes.number,
  })),
  map: PropTypes.object,
};

export default Map;
