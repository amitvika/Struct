import React from 'react';

import AccessSetupAPI from '@monostruct/common/api/accessSetup.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { accessSetupFields } from '@monostruct/common/constants/accessSetup';
import ManageAccessSetupModal from './ManageAccessSetupModal';
import AccessConfiguration from '../../pages/AccessConfiguration';

const AccessSetup = ({ handleTabChange, accessSetupId }) => {
  if (accessSetupId) {
    return <AccessConfiguration accessSetupId={accessSetupId} />;
  }
  return (
    <TableGridView
      title={'Access Setup'}
      fields={accessSetupFields}
      fetchList={AccessSetupAPI.fetchAccessSetup}
      upsertListItem={AccessSetupAPI.upsertAccessSetup}
      isManageTeamVisible={true}
      ManageTeamModal={ManageAccessSetupModal}
      handleItemClick={(id) => handleTabChange({}, 3, id)}
    />
  );
};

export default AccessSetup;
