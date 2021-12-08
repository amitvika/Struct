import MainModal from '@monostruct/common/components/Modal';
import React, { Component } from 'react';

import //   ThreejsViewer
'../../../components';

export default class AssemblyThreejsView extends Component {
  render() {
    const { isModalVisible, handleModalToggle } = this.props;
    return (
      <MainModal
        open={isModalVisible}
        toggleModal={handleModalToggle}
        title={'Thressjs'}
      >
        <div style={{ height: '40vh' }}>
          {/* <ThreejsViewer isLoading={false}
              data={MeshJSON}
            ></ThreejsViewer> */}
        </div>
      </MainModal>
    );
  }
}
