import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import { connect } from "react-redux";
import { addItem } from "../actions/itemActions";
import PropTypes from "prop-types";
class ItemModal extends Component {
  state = {
    modal: false,
    name: ""
  };
  static propTypes = {
    auth: PropTypes.object.isRequired
  };
  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };
  onSubmit = e => {
    e.preventDefault();

    const newItem = {
      name: this.state.name
    };
    this.props.addItem(newItem);
    this.toggle();
  };
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <div>
        {this.props.auth.isAuthenticated ? (
          <Button
            color="dark"
            style={{ marginBottom: "2rem" }}
            onClick={this.toggle}
          >
            Add Item
          </Button>
        ) : (
          ""
        )}

        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Add Item</ModalHeader>
          <ModalBody>
            <Form onSubmit={this.onSubmit}>
              <FormGroup>
                <Label for="item">Item</Label>
                <Input
                  type="text"
                  name="name" //has to match the name of the variable in the state
                  id="item"
                  placeholder="Add Item"
                  onChange={this.onChange}
                  style={{ marginBottom: "2rem" }}
                />
                <Button color="dark" style={{ marginBottom: "2rem" }} block>
                  Add
                </Button>
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  item: state.item, //posts is from the root reducer. Items is from the postReducer, which is ultimately getting the action from the postAction.  This expression then allows for use of this.props.posts
  auth: state.auth
});

export default connect(mapStateToProps, { addItem })(ItemModal);
