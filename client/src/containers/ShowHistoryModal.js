import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import MaterialTable from "material-table";
import ConfigurationHistoryAPI from '../api/configurationHistory.api';

const ShowHistoryModal = ({ isVisible, pageName, selectedItemId, handleHistoryToggle }) => {

  const [isModalVisible, setIsModalVisible] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsModalVisible(!isModalVisible);
    }
  }, [isVisible]);

  const handleModalToggle = () => {
    setIsModalVisible(!isModalVisible);
    handleHistoryToggle({})
  }

  const handleQuery = (query) => {
    return new Promise(async (resolve, reject) => {

      ConfigurationHistoryAPI
        .getConfigurationHistory(`limit=${query.pageSize}&page=${query.page + 1}&pageName=${pageName}&updatedId=${selectedItemId}`)
        .then(result => result.data)
        .then(result => {
          let rowData = result.docs;

          rowData = rowData.map((x, index) => {
            if (x.client !== null) {
              return {
                user: x.updatedBy.name,
                updatedItem: x.updatedObject,
                type: x.updateType,
                client: x.client.name,
                model: x.model,
                time: x.date,
                update: x.update
              };
            } else {
              return {
                user: x.updatedBy.name,
                updatedItem: x.updatedObject,
                type: x.updateType,
                client: x.client,
                model: x.model,
                time: x.date,
                update: x.update
              };
            }
          });

          resolve({
            data: rowData,
            page: result.page - 1,
            totalCount: result.totalPages,
          })
        })
        .catch(err => console.log(err));
    })
  }

  return (
    <div>
      <Modal isOpen={isModalVisible} toggle={handleModalToggle}>
        <ModalHeader toggle={handleModalToggle}>History</ModalHeader>
        <ModalBody>
          <MaterialTable
            columns={[
              { title: "Changed By", field: "user" },
              { title: "Client", field: "client" },
              { title: "Table", field: "model" },
              { title: "Change Type", field: "type" },
              { title: "Updated Item Id", field: "updatedItem" },
              { title: "Change Date/Time", field: "time" }
            ]}
            data={query => handleQuery(query)}
            title="Configuration History"
            detailPanel={rowData => {
              return "Update: " + JSON.stringify(rowData.update);
            }}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}

export default ShowHistoryModal;
