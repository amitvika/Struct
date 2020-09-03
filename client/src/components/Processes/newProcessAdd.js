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
import { tokenConfig } from "../../actions/authActions";
import axios from "axios";
import store from "../../store";
class newProcessAdd extends Component {
  state = {
    modal: false,
    name: ""
  };
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = e => {
    e.preventDefault();

    console.log(this.state.name);
    const newClient = {
      name: this.state.name
    }; //

    axios
      .post("/api/processes", newClient, tokenConfig(store.getState))
      .then(res => {
        console.log(res.data);
        this.retrieveFromDb();
      })
      .catch(err => console.log(err.data));
  };

  render() {
    return (
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
    );
  }
}

const mapStateToProps = state => ({
  item: state.item, //posts is from the root reducer. Items is from the postReducer, which is ultimately getting the action from the postAction.  This expression then allows for use of this.props.posts
  auth: state.auth
});

export default connect(mapStateToProps, null)(newProcessAdd);
