import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Popover, PopoverBody, PopoverHeader,
  Row
} from 'reactstrap';
import { connect } from "react-redux";

import { setCurrentUser } from "../../../actions/authAction";
import jwtDecode from "jwt-decode";
import {useForm} from "../../../components/hooks";

const mapStateToProps = (state) => ({
  auth: state.auth,
});

const mapDispatchToProps = { setCurrentUser };

const Login = (props) => {
  const { auth, history, setCurrentUser } = props;
  const [error, setError] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const validator = useCallback((name, value) => {
    return window._.isEmpty(value) ? 'Required' : null;
  }, []);
  const onSubmit = useCallback((values) => {
    const { merchantid, username, password } = values;
    window.api
      .post("/auth/login", { merchantid, username, password })
      .then(res => {
        const { token } = res;
        localStorage.setItem("jwtToken", token);
        const decoded = jwtDecode(token);
        setCurrentUser({ admin: decoded, token: token, merchantid: merchantid });
      })
      .catch((e) => {
        if (e.status === 401) {
          setError('Incorrect login credential');
        } else {
          setError('Something went wrong. Please retry.');
        }
      });
  }, []);
  const { values, errors, handleChange, handleSubmit } = useForm({ onSubmit, validator  });

  useEffect(() => {
    if (!window._.isEmpty(auth.admin)) {
      history.push('/');
    }
  }, [auth]);

  const togglePopover = useCallback(() => {
    setPopoverOpen(!popoverOpen);
  }, [popoverOpen]);

  return (
    <div className="app flex-row align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md="8">
            <CardGroup>
              <Card className="p-4">
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-bag" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Merchant ID" autoComplete="merchantid" name={'merchantid'} onChange={handleChange}/>
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Username" autoComplete="username" name={'username'} onChange={handleChange}/>
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Password" autoComplete="current-password" name={'password'} onChange={handleChange}/>
                    </InputGroup>
                    <Row>
                      <Col xs="6">
                        <Button color="link" className="px-0" id="forgotPasswordBtn" onClick={togglePopover}>Forgot password?</Button>
                        <Popover placement="bottom" isOpen={popoverOpen} target="forgotPasswordBtn" toggle={togglePopover}>
                          <PopoverBody>Having issues with log in? please send us an email <a href = "mailto: support@delvify.io">support@delvify.io</a></PopoverBody>
                        </Popover>
                      </Col>
                      <Col xs="6" className="text-right">
                        <Button color="primary" className="px-4" type={'submit'} disabled={!window._.isEmpty(errors)}>Login</Button>
                      </Col>
                    </Row>
                    <Row className="mt-2 d-flex justify-content-center">
                      <span className="text-danger text-center">{error}</span>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </CardGroup>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
