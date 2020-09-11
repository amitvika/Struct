import React, { useEffect } from 'react';
import MaterialTable from "material-table";
import InfoIcon from "@material-ui/icons/Info";
import { Spinner } from "reactstrap";
import { Checkbox } from "@material-ui/core";
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from "react-router-dom";
import { fetchClientAction } from '../../actions/client.action'

export default function ClientBasedAccess({ access, updateAccessState, userAccessLoaded }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { isLoading, data } = useSelector(state => state.clients);

  useEffect(() => {
    dispatch(fetchClientAction());
  }, []);

  const renderData = () => {
    return data.map((x, index) => {
      if (access[x._id]) {
        return {
          clientId: x._id,
          client: x.name,
          allow: <Checkbox color="primary" name={x._id} defaultChecked onChange={updateAccessState} />
        };
      } else {
        return {
          clientId: x._id,
          client: x.name,
          allow: <Checkbox color="primary" name={x._id} onChange={updateAccessState} />
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
      data={renderData()}
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
