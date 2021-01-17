import React, { useEffect } from 'react';
import MaterialTable from "material-table";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";
import { Spinner } from "reactstrap";
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientAction } from '../../actions/viewAccess.action';

export default function ClientBasedAccess({ userAccessLoaded, access, clientList }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.access.isCBALoading);
  const data = useSelector(state => state.access.cba);

  // useEffect(() => {
  //   if (userAccessLoaded) {
  //     dispatch(fetchClientAction(access))
  //   }
  // }, [userAccessLoaded]);

  const refactorData = () => {
    return clientList.map((x, index) => {
      if (access[x._id]) {
        // this.setState({
        //   [x._id]: true
        // });
        return {
          clientId: x._id,
          client: x.name,
          allow: <Checkbox color="primary" name={x._id} defaultChecked />
        };
      } else {
        return {
          clientId: x._id,
          client: x.name,
          allow: <Checkbox color="primary" name={x._id} />
        };
      }
    });
  }

  if (isLoading || !userAccessLoaded) {
    return (<div
      style={{
        display: "flex",
        justifyContent: "center"
      }}>
      <Spinner animation="border" />
    </div>)
  }
  return (
    <MaterialTable
      columns={[
        { title: "Client", field: "client" },
        { title: "Client Id", field: "clientId" },
        { title: "Allow Access", field: "allow" }
      ]}
      data={refactorData()}
      options={{
        search: false,
        pageSize: 15,
        pageSizeOptions: [15, 50, 100],
        paging: false
      }}
      title={
        <h5 title="This configuration determines user access to all the below configurations for each client in this table">
          <InfoIcon /> Client Based Access
                </h5>
      }
    />
  )
}
