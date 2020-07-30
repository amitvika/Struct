import React, { Component } from "react";
import {
  ListGroup,
  ListGroupItem,
  Button,
  Card,
  CardBody,
  CardHeader
} from "reactstrap";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { connect } from "react-redux"; //connects component to the redux store
import { getItems, deleteItem } from "../actions/itemActions"; //imports the fetchPost action from the fetchPosts file defined in the  actions folder
import PropTypes from "prop-types";

class ShoppingList extends Component {
  componentDidMount() {
    this.props.getItems();
  }
  onDeleteClick = id => {
    this.props.deleteItem(id);
  };

  render() {
    const { items } = this.props.item;

    return (
      <Card>
        <CardHeader>Featured</CardHeader>
        <CardBody>
          <ListGroup>
            <TransitionGroup className="shopping-list">
              {items.map(({ _id, name }) => (
                <CSSTransition key={_id} timeout={500} classNames="fade">
                  <ListGroupItem>
                    {this.props.auth.isAuthenticated ? (
                      <Button
                        className="remove-btn"
                        color="danger"
                        size="sm"
                        onClick={this.onDeleteClick.bind(this, _id)}
                      >
                        &times;
                      </Button>
                    ) : (
                      ""
                    )}

                    {name}
                  </ListGroupItem>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </ListGroup>
        </CardBody>
      </Card>
    );
  }
}

ShoppingList.propTypes = {
  getItems: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  item: state.item, //posts is from the root reducer. Items is from the postReducer, which is ultimately getting the action from the postAction.  This expression then allows for use of this.props.posts
  auth: state.auth
});

export default connect(mapStateToProps, { getItems, deleteItem })(ShoppingList);
