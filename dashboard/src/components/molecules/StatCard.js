import React, { useCallback } from 'react';
import PropTypes from "prop-types";
import {Card, CardBody, Spinner} from "reactstrap";
import classNames from 'classnames';

const StatCard = (props) => {
  const { className, id, icon, color, value, title, activeTab, children, onChangeTab, loading, ...attributes } = props;
  const active = activeTab && id && activeTab === id;
  const bgColor = active ? `bg-${color}` : 'bg-white';
  const textColor = active ? 'text-white' : `text-${color}`;
  const muteColor = active ? 'text-white' : 'text-mute';

  const onClick = useCallback(() => {
    if (onChangeTab && !loading) {
      onChangeTab(id);
    }
  }, [loading]);

  return (
    <Card className={classNames(className, bgColor)} style={{ cursor: onChangeTab ? 'pointer' : 'default' }} {...attributes} onClick={onClick}>
      <CardBody>
        <div className="h1 text-muted text-right mb-2">
          <i className={classNames(icon, textColor)} />
        </div>
        {
          loading ?
            <div><Spinner color={active ? 'white' : color} /></div> :
            <div className={classNames('h4 mb-0', textColor)}>{children}</div>
        }
        <small className={`${muteColor} text-uppercase font-weight-bold`}>{title}</small>
      </CardBody>
    </Card>
  )
};

StatCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.string,
  icon: PropTypes.string,
  activeTab: PropTypes.string,
  color: PropTypes.string,
  onChangeTab: PropTypes.func,
  loading: PropTypes.bool,
};

export default StatCard;
