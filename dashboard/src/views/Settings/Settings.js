import React, { useCallback, useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Collapse,
  FormGroup,
  Label, Modal, ModalBody, ModalFooter, ModalHeader,
  Row,
  Input,
  Form,
} from 'reactstrap';
import { connect } from 'react-redux';
import { useForm } from "../../components/hooks";
import {adminMapper} from "../../utils/mappers";

const mapStateToProps = (state) => ({
  me: window._.get(state, ['auth', 'admin'], {})
});

const Settings = (props) => {
  const { me } = props;
  const [passwordModalIsOpen, setPasswordModalIsOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminModalError, setAdminModalError] = useState(null);
  const [admins, setAdmins] = useState([]);
  const togglePasswordModal = useCallback(() => {
    setPasswordModalIsOpen(!passwordModalIsOpen);
  }, [passwordModalIsOpen]);
  const toggleAdminModal = useCallback(() => {
    setAdminModalOpen(!adminModalOpen);
    setAdminModalError(null);
  }, [adminModalOpen]);
  const validator = useCallback((name, value) => {
    switch (name) {
      case 'username': return window._.isEmpty(value) ? 'Username required' : null;
      case 'password':
      case 'newPassword':
      case 'confirmPassword':
        return window._.isEmpty(value) ? 'Required' : null;
    }
  }, []);
  const onSubmit = useCallback((values, errors) => {
    console.log('onSubmit', values, errors);
  }, []);
  const onSubmitPassword = useCallback((values, errors) => {
    console.log('password', values, errors);
  }, []);

  const onAdminDelete = useCallback((values) => {
    const ids = values.admins;
    if (window._.isEmpty(ids)) return;
    window.api.delete('admin', { ids })
      .then(() => {
        setAdmins(window._.filter(admins, (admin) => !ids.includes(admin.id)));
      })
      .catch(console.log);
    console.log(values);
  }, [admins]);

  const onAddAdmin = useCallback((values) => {
    const { username, password } = values;
    if (values.password !== values.confirmPassword) {
      return setAdminModalError('Password not match');
    }
    window.api.post('admin',{ username, password, createdBy: me.id })
      .then((res) => {
        setAdmins([...admins, adminMapper(res)]);
        setAdminModalOpen(false);
      })
      .catch((e) => {
        setAdminModalError(e.message);
      });
  }, [admins, me]);

  const { values, errors, handleChange, handleSubmit } = useForm({ onSubmit, validator });
  const { values: valuesPassword, errors: errorsPassword, handleChange: handleChangePassword, handleSubmit: handleSubmitPassword } = useForm({ onSubmit: onSubmitPassword, validator });
  const { values: valuesDeleteAdmins, errors: errorsDeleteAdmins, handleChange: handleChangeDeleteAdmins, handleSubmit: handleSubmitDeleteAdmins } = useForm({ onSubmit: onAdminDelete, validator });
  const { values: valuesAdmin, errors: errorsAdmin, handleChange: handleChangeAdmin, handleSubmit: handleSubmitAdmin } = useForm({ onSubmit: onAddAdmin, validator });

  useEffect(() => {
    window.api.get('admin')
      .then((res) => {
        setAdmins(res.map(adminMapper).filter((admin) => admin.username !== 'delvify_root'));
      })
      .catch(console.log);
  }, []);

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" sm="6">
          <Form onSubmit={handleSubmit} method="post" encType="multipart/form-data" className="form-horizontal">
            <Card>
              <CardHeader>
                <strong>Account Info</strong>
              </CardHeader>
              <CardBody>
                <FormGroup row>
                  <Col md="2">
                    <Label htmlFor="username">Username</Label>
                  </Col>
                  <Col md="8">
                    <Input size="16" type="text" name={'username'} onChange={handleChange}/>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="2">
                    <Label htmlFor="onAddToCart">Password</Label>
                  </Col>
                  <Col md="8">
                    <Button color="primary" onClick={togglePasswordModal}>Reset password</Button>
                  </Col>
                </FormGroup>
              </CardBody>
              <CardFooter>
                <Button type="submit" size="sm" color="primary" className="float-right"><i className="fa fa-dot-circle-o" /> Save</Button>
              </CardFooter>
            </Card>
          </Form>
          <Form onSubmit={handleSubmitDeleteAdmins}>
            <Card>
              <CardHeader>
                <strong>Admins</strong>
              </CardHeader>
              <CardBody>
                <Input type="select" name="admins" id="admins" multiple onChange={handleChangeDeleteAdmins}>
                  {
                    admins.map((admin) => {
                      return (
                        <option value={admin.id} key={`admin_${admin.id}`} disabled={me.id === admin.id}>
                          {admin.username}{me.id === admin.id ? ' (You)' : ''}
                        </option>
                      );
                    })
                  }
                </Input>
              </CardBody>
              <CardFooter>
                <Button size="sm" color="primary" className="float-right" onClick={toggleAdminModal}><i className="fa fa-user-plus" /> Add Admin</Button>
                <Button type="submit" size="sm" color="danger" className="float-right mr-2"><i className="fa fa-user-times" /> Remove</Button>
              </CardFooter>
            </Card>
          </Form>
          <Modal isOpen={passwordModalIsOpen} toggle={togglePasswordModal}>
            <Form onSubmit={handleSubmitPassword}>
              <ModalHeader toggle={togglePasswordModal}>Reset Password</ModalHeader>
              <ModalBody>
                <FormGroup row>
                  <Col md="12">
                    <FormGroup row>
                      <Col md="3"><Label>Old password</Label></Col>
                      <Col md="8"><Input size="16" name="password" type="password" onChange={handleChangePassword}/></Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md="3"><Label>New password</Label></Col>
                      <Col md="8"><Input size="16" name="newPassword" type="password" onChange={handleChangePassword}/></Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md="3"><Label>Confirm new password</Label></Col>
                      <Col md="8"><Input size="16" name="confirmPassword" type="password" onChange={handleChangePassword}/></Col>
                    </FormGroup>
                  </Col>
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" type="submit" disabled={!valuesPassword.password || !valuesPassword.newPassword || !valuesPassword.confirmPassword}>Save</Button>
              </ModalFooter>
            </Form>
          </Modal>
          <Modal isOpen={adminModalOpen} toggle={toggleAdminModal}>
            <Form onSubmit={handleSubmitAdmin}>
              <ModalHeader toggle={toggleAdminModal}>Add admin</ModalHeader>
              <ModalBody>
                <FormGroup row>
                  <Col md="12">
                    <FormGroup row>
                      <Col md="3"><Label>Username</Label></Col>
                      <Col md="8"><Input size="16" name="username" type="text" onChange={handleChangeAdmin}/></Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md="3"><Label>Password</Label></Col>
                      <Col md="8"><Input size="16" name="password" type="password" onChange={handleChangeAdmin}/></Col>
                    </FormGroup>
                    <FormGroup row>
                      <Col md="3"><Label>Confirm password</Label></Col>
                      <Col md="8"><Input size="16" name="confirmPassword" type="password" onChange={handleChangeAdmin}/></Col>
                    </FormGroup>
                  </Col>
                </FormGroup>
                <Row className="d-flex justify-content-center">
                  <span className="text-danger text-center">{adminModalError}</span>
                </Row>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" type="submit" disabled={!valuesAdmin.username || !valuesAdmin.password || !valuesAdmin.confirmPassword}>Save</Button>
              </ModalFooter>
            </Form>
          </Modal>
        </Col>
        <Col xs="12" sm="6">
          <Form>
            <Card>
              <CardHeader>
                <strong>Company Info</strong>
              </CardHeader>
              <CardBody>
                <FormGroup row>
                  <Col md="3"><Label htmlFor="companyName">Company Name</Label></Col>
                  <Col md="9"><Input size="16" type="text" name={'companyName'} onChange={handleChange}/></Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3"><Label htmlFor="email">Email Address</Label></Col>
                  <Col md="9"><Input size="16" type="email" name={'email'} onChange={handleChange}/></Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3"><Label htmlFor="contactNumber">Contact Number</Label></Col>
                  <Col md="9"><Input size="16" type="tel" name={'contactNumber'} onChange={handleChange}/></Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3"><Label htmlFor="billingAddress">Billing Address</Label></Col>
                  <Col md="9"><Input size="16" type="text" name={'billingAddress'} onChange={handleChange}/></Col>
                </FormGroup>
                <FormGroup row>
                  <Col md="3"><Label htmlFor="billingEmail">Billing Email</Label></Col>
                  <Col md="9"><Input size="16" type="email" name={'billingEmail'} onChange={handleChange}/></Col>
                </FormGroup>
              </CardBody>
              <CardFooter>
                <Button type="submit" size="sm" color="primary" className="float-right"><i className="fa fa-dot-circle-o" /> Save</Button>
              </CardFooter>
            </Card>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default connect(mapStateToProps)(Settings);
