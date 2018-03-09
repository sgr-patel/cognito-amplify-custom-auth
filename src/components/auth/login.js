import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Segment, Form, Icon, Button, Label } from 'semantic-ui-react';
import { InputField } from '../custom/form_controls';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
//import * as actionCreators from '../../actions/auth_actions';
import {
  login as loginAction,
  confirmLogin as confirmLoginAction,
  setNewPassword as setPasswordAction } from '../../actions/auth_actions';
import { store } from '../../index';
import { AUTH_ERROR_CLEAR } from '../../actions/types';

class Login extends Component {

  constructor(props) {
    super(props);
    this.renderAlert.bind(this);
  }

  dispatchResetError = () => {
    let counter = 6;
    const seconds = setInterval(() => {
      if (counter == 0) {
        clearInterval(seconds);
        // dispatch INIT_STATE
        console.log('Login.dispatchInitState() dispatching INIT_STATE');
        store.dispatch({ type: AUTH_ERROR_CLEAR });
      }
      counter = counter - 1;
    }, 1000);
  }

  onFormSubmit({ username, password, newPassword, newPasswordConfirm, code}) {
    const {
      cognitoUser,
      mfaRequired,
      changePassword} = this.props;

    console.log('Login.onFormSubmit() username, password, newPassword, newPasswordConfirm, code, mfaRequired, changePassword, cognitoUser:', {username, password, newPassword, newPasswordConfirm, code, mfaRequired, changePassword, cognitoUser});

    if ((typeof mfaRequired == 'undefined' || mfaRequired == false) &&
      (typeof changePassword == 'undefined' || changePassword == false)) {
      console.log('Login.onFormSubmit(): invoking loginAction()');
      // we pass in the history function so we can navigate from loginAction
      this.props.loginAction({ username, password }, this.props.history);
    } else if (mfaRequired == true && changePassword == false) {
      // we pass in the history function so we can navigate from loginAction
      this.props.confirmLoginAction({ cognitoUser, code }, this.props.history);
    } else if (mfaRequired == false && changePassword == true) {
      console.log('Login.onFormSubmit(): invoking setPasswordAction()');
      const { cognitoUser } = this.props;

      this.props.setPasswordAction({cognitoUser, newPassword})
    }
  }

  renderAlert() {
    // consume errorMessage and then dispatch event after 4 seconds to clear the state such
    // that message disappears from the screen
    const { errorMessage } = this.props;

    if (typeof errorMessage != 'undefined' && errorMessage != '' ) {

      console.error('Login.renderAlert(): error! message: ', errorMessage);
      this.dispatchResetError();

      return errorMessage;
    }
  }

  render() {
    const {
      handleSubmit,
      changePassword,
      mfaRequired,
      resendCode,
      fields: { username, password, newPassword, newPasswordConfirm, code }} = this.props;
    const invalidCredentialsMessage = this.renderAlert();

    return (
      <div>
        { !mfaRequired && (

          <div className="login-page">
            { !changePassword && (
              <Form onSubmit={handleSubmit(this.onFormSubmit.bind(this))}>
                <div className="fill-in">
                  <Field
                    name="username"
                    component={InputField}
                    label={{ content: <Icon color="orange" name="user" size="large" /> }}
                    labelPosition="left"
                    type="text"
                    placeholder="Enter username" />
                  <Field
                    name="password"
                    component={InputField}
                    label={{ content: <Icon color="orange" name="lock" size="large" /> }}
                    labelPosition="left"
                    type="password"
                    placeholder="Enter password" />
                  <div className="forgot-password">
                    { invalidCredentialsMessage && (<Label basic color="red" pointing="above">{ invalidCredentialsMessage }</Label>) }
                    <Link to="/forget" >Forgot Password?</Link>
                  </div>
                </div>
                <div className="button-holder">
                  <Segment clearing className="button-holder-segment">
                    <Form.Field control={Button} compact
                      className="login-button"
                      floated="left"
                      type="submit">
                      Login
                    </Form.Field>
                    <Link to="/register"><Button compact disabled floated="right">Register</Button></Link>
                  </Segment>
                </div>
              </Form>
            )}

            { changePassword == true && (
              <Form onSubmit={handleSubmit(this.onFormSubmit.bind(this))}>
                <div className="fill-in">
                  <Field
                    name="newPassword"
                    component={InputField}
                    label={{ content: <Icon color="orange" name="lock" size="large" /> }}
                    labelPosition="left"
                    type="password"
                    placeholder="Enter new password" />
                  <Field
                    name="newPasswordConfirm"
                    component={InputField}
                    label={{ content: <Icon color="orange" name="lock" size="large" /> }}
                    labelPosition="left"
                    type="password"
                    placeholder="Re-enter new password" />
                  <div className="forgot-password">
                    { invalidCredentialsMessage && (<Label basic color="red" pointing="above">{ invalidCredentialsMessage }</Label>) }
                  </div>
                </div>
                <div className="button-holder">
                  <Segment clearing className="button-holder-segment">
                    <Form.Field control={Button} compact
                      className="change-password-button"
                      floated="left"
                      type="submit">
                      Change Password
                    </Form.Field>
                  </Segment>
                </div>
              </Form>
            )}
          </div>
        )}

        { mfaRequired && (
          <div className="login-page">
            <Form onSubmit={handleSubmit(this.onFormSubmit.bind(this))}>
              <div className="fill-in">
                <Field
                  name="code"
                  component={InputField}
                  label={{ content: <Icon color="orange" name="lock" size="large" /> }}
                  labelPosition="left"
                  type="text"
                  placeholder="Enter verification code" />
                <div className="error-message">
                  { invalidCredentialsMessage && (<Label basic color="red" pointing="above">{ invalidCredentialsMessage }</Label>) }
                </div>
                <div className="button-holder">
                  <Segment clearing className="button-holder-segment">
                    <Form.Field control={Button} compact
                      className="verify-code-button"
                      floated="left"
                      type="submit">
                      Verify
                    </Form.Field>
                    { resendCode && (
                      <Form.Field control={Button} compact
                        className="resend-code-button"
                        floated="left"
                        type="submit">
                        Resend Code
                      </Form.Field>
                    )}
                  </Segment>
                </div>
              </div>
            </Form>
          </div>
        )}
      </div>
    );
  }
}

// Redux-form validation
function validate(formProps) {
  const errors = {};

  if (!formProps.username) {
    errors.username = 'Please enter a valid username';
  }

  if (!formProps.password) {
    errors.password = 'Please enter a password';
  }

  if (formProps.newPassword !=  formProps.newPasswordConfirm ) {
    errors.newPasswordConfirm = 'Passwords do not match';
  }

  return errors;
}

// Runtime type checking for React props
Login.propTypes = {
  loginAction: PropTypes.func,
  history: PropTypes.object,
  cognitoUser: PropTypes.object,
  errorMessage: PropTypes.string,
  changePassword: PropTypes.bool,
  handleSubmit: PropTypes.func,
  fields: PropTypes.arrayOf(PropTypes.string)
};

// Lets connect props and dispatch to redux store.
// 1. implement mapStateToProps() and mapDispatchToProps()
// 2. connect() methods above to redux store
// 3. finally, connect reduxForm
// Reference: https://redux-form.com/7.2.3/docs/faq/howtoconnect.md/

function mapStateToProps(state) {
  //console.log('Login.mapStateToProps() state:', state);
  //console.log('Login.mapStateToProps() ownProps:', ownProps);
  return {
    errorMessage: state.auth.error,
    mfaRequired: state.auth.mfa,
    changePassword: state.auth.changePassword,
    cognitoUser: state.auth.cognitoUser
  };
}

function mapDispatchToProps(dispatch) {
  //console.log('Login.mapDispatchToProps() ');
  // return {
  //   ...bindActionCreators(actionCreators, dispatch),
  //   dispatch
  // };

  return {
    ...bindActionCreators({
      loginAction,
      confirmLoginAction,
      setPasswordAction }, dispatch),
    dispatch
  };
}

Login = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

export default reduxForm({
  form: 'loginForm',
  fields: ['username', 'password', 'newPassword', 'newPasswordConfirm', 'code'],
  validate
})(Login);
