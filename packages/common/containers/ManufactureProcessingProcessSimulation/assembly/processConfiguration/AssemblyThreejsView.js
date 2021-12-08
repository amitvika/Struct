import React, { Component } from 'react';
export default class AssemblyThreejsView extends Component {
  render() {
    const { isModalVisible, handleModalToggle } = this.props;
    return (
      <div style={{ height: '40vh' }}>
        <div id="graphical_view" className="Viewer_Graphical"></div>
      </div>
    );
  }
}
