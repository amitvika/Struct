import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateUsers } from '../actions/userAccessUserActions';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MainModal from '@monostruct/common/components/Modal';

class UserAccessModal extends Component {
  state = {
    modal: false,
    chooseUserRowData: [],
    selectedUserRowData: [],
    originalSelectedUserRowData: [],
    removedUserRowData: [],
    tableLoaded: false,
    columnSelectedUsers: [
      { title: 'User Email', field: 'id' },
      { title: 'Name', field: 'name' }
    ],
    columns: [
      { title: 'User Email', field: 'id' },
      { title: 'Name', field: 'name' },
      { title: 'Current Access', field: 'currentAccess' }
    ]
  };
  componentDidMount() {
    this.retrieveFromDb();
  }
  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };
  retrieveFromDb = () => {
    this.setState((state) => ({
      tableLoaded: false,
      chooseUserRowData: state.chooseUserRowData
    }));
    axios
      .get('/api/userList')
      .then((res) => {
        var userRowData = res.data.map((x, index) => {
          if (x.userAccess != null) {
            return {
              id: x._id,
              email: x.email,
              name: x.name,
              currentAccess: x.userAccess.name,
              currentAccessId: x.userAccess._id
            };
          } else {
            return {
              id: x._id,
              email: x.email,
              name: x.name,
              currentAccess: 'Unassigned',
              currentAccessId: null
            };
          }
        });

        var chooseUserRowData = userRowData.filter((x) => {
          return x.currentAccessId !== this.props.userAccessState.userAccessId;
        });

        var selectedUserRowData = userRowData.filter((x) => {
          return x.currentAccessId === this.props.userAccessState.userAccessId;
        });

        this.setState((state) => ({
          tableLoaded: true,
          chooseUserRowData,
          selectedUserRowData,
          originalSelectedUserRowData: selectedUserRowData
        }));
      })
      .catch((err) => console.log(err));
  };

  addUser = (event) => {
    var chooseUserRowData = this.state.chooseUserRowData;
    var selectedUserRowData = this.state.selectedUserRowData;
    chooseUserRowData = chooseUserRowData.filter((x, index) => {
      if (event.id === x.id) {
        selectedUserRowData.push(x);
      }
      return x.id !== event.id;
    });

    var removedUserRowData = this.state.originalSelectedUserRowData.filter(
      (x, index) => {
        return !selectedUserRowData.includes(x);
      }
    );
    //console.log(this.state.originalSelectedUserRowData);
    //console.log(removedUserRowData);
    this.setState({
      selectedUserRowData,
      chooseUserRowData,
      removedUserRowData
    });
    this.props.updateUsers({
      newUsers: selectedUserRowData,
      removedUsers: removedUserRowData
    });
  };
  removeUser = (event) => {
    var chooseUserRowData = this.state.chooseUserRowData;
    var selectedUserRowData = this.state.selectedUserRowData;
    selectedUserRowData = selectedUserRowData.filter((x, index) => {
      if (event.id === x.id) {
        chooseUserRowData.push(x);
      }
      return x.id !== event.id;
    });

    //if in orignal list but notselected rowdata, add to delete list
    var removedUserRowData = this.state.originalSelectedUserRowData.filter(
      (x, index) => {
        return !selectedUserRowData.includes(x);
      }
    );
    //console.log(this.state.originalSelectedUserRowData);
    //console.log(removedUserRowData);

    this.setState({
      selectedUserRowData,
      chooseUserRowData,
      removedUserRowData
    });
    this.props.updateUsers({
      newUsers: selectedUserRowData,
      removedUsers: removedUserRowData
    });
  };

  render() {
    return (
      <div>
        {/* <Button
          className="mt-2 mb-3"
          variant="contained"
          color="primary"
          onClick={this.toggle}
        >
          Assign Users
        </Button> */}
        <MainModal
          open={this.state.modal}
          toggleModal={this.toggle}
          title="Please click each row you would like to move from one table to the other.  Save the changes with the save button to the bottom right"
        >
          <InfoIcon />
          {this.props.userAccessState.userAccessName} User Assignment{' '}
          {this.state.tableLoaded ? (
            <div>
              <h5 className="mt-2">Assigned Users</h5>
              <TableContainer className="mb-2" component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>User IDs</TableCell>
                      <TableCell>Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.selectedUserRowData.map((row) => (
                      <TableRow
                        key={row.id}
                        onClick={this.removeUser.bind(this, row)}
                      >
                        <TableCell component="th" scope="row">
                          {row.email}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <h5>Select Users</h5>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>User IDs</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Current Access</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.chooseUserRowData.map((row) => (
                      <TableRow
                        key={row.id}
                        onClick={this.addUser.bind(this, row)}
                      >
                        <TableCell component="th" scope="row">
                          {row.email}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.currentAccess}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className="mb-2"> </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <CircularProgress />
            </div>
          )}
        </MainModal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAutheticated: state.auth.isAutheticated,
  error: state.error
});

export default connect(mapStateToProps, { updateUsers })(UserAccessModal);
//mapStateToProps gets state variables from elsewhere in the app.
//the stuff in the curly braces are methods brought in to modify state in other parts of the app
//all these things will be declared in the component props
