import React, { useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem } from 'reactstrap';
import { connect } from 'react-redux';

import { AppAsideToggler, AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import { logoutUser } from "../../actions/authAction";
import logo from '../../assets/img/brand/logo.svg'
import logo_small from '../../assets/img/brand/logo_small.svg'
import moment from "moment-timezone";

const mapStateToProps = (state) => ({
  auth: state.auth,
});

const mapDispatchToProps = {
  logoutUser,
};

const DefaultHeader = (props) => {
  const { logoutUser, auth } = props;
  const logout = useCallback(() => {
    logoutUser();
  }, []);

  return (
    <React.Fragment>
      <AppSidebarToggler className="d-lg-none" display="md" mobile />
      <AppNavbarBrand
        full={{ src: logo, width: 89, height: 25, alt: 'Delvify' }}
        minimized={{ src: logo_small, width: 30, height: 30, alt: 'Delvify' }}
      />
      <AppSidebarToggler className="d-md-down-none" display="lg" />

      <span>{`Last updated: ${moment().tz(moment.tz.guess()).format('MMMM D, YYYY h:mm A z')}`}</span>
      <Nav className="ml-auto" navbar>
        <AppHeaderDropdown direction="down" className="mr-5">
          <DropdownToggle nav>
            <span>{ auth.admin.username } <i className="fa fa-user" /></span>
          </DropdownToggle>
          <DropdownMenu right style={{ right: 'auto' }}>
            <Link to={'/settings'} className="text-decoration-none"><DropdownItem><i className="fa fa-wrench" /> My Account</DropdownItem></Link>
            <DropdownItem onClick={logout}><i className="fa fa-lock" /> Logout</DropdownItem>
          </DropdownMenu>
        </AppHeaderDropdown>
      </Nav>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DefaultHeader);
