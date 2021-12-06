import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';

import Headding from '@monostruct/common/components/atoms/Headding';
import Input from '@monostruct/common/components/atoms/Input';
import Space from '@monostruct/common/components/atoms/Space';
import ClientAPI from '@monostruct/common/api/clients.api';
import { useDispatch } from 'react-redux';
import {
  showErrorAlert,
  showSuccessAlert,
} from '../../../actions/alert.action';

export default function ClientPortal({
  clientData,
  handleClientUpdate,
  isWebsiteNameAvailable,
}) {
  const dispatch = useDispatch();
  const [isClientSiteUpdated, setIsClientSiteUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSiteNameChange = (event) => {
    event.persist();
    if (event.target !== null) {
      setIsClientSiteUpdated(true);
      handleClientUpdate({ ...clientData, domain_name: event.target.value });
    }
  };

  const handleChange = (event) => {
    setIsClientSiteUpdated(true);
    handleClientUpdate({
      ...clientData,
      is_domain_active: event.target.checked,
    });
  };

  const handleSubmit = () => {
    setIsClientSiteUpdated(false);

    setIsLoading(true);
    ClientAPI.configureSubdomain(clientData.id, {
      domain_name: clientData.domain_name,
      is_domain_active: clientData.is_domain_active,
    })
      .then((res) => {
        setIsLoading(false);
        dispatch(showSuccessAlert({ message: 'All data is saved' }));
      })
      .catch((err) => {
        setIsLoading(false);
        console.log('Error', err);
        dispatch(showErrorAlert({ message: 'Unable to save data' }));
      });
  };

  return (
    <div>
      <Headding fontSize={30} title={'Configure Client Site'} />

      <Space size={20} />

      <Grid className="section-padding-left" container spacing={4}>
        <Grid item xs={4}>
          <Headding bold title={'Setup Client Site'} />
        </Grid>

        <Grid item xs={8}>
          <Checkbox
            inputProps={{ 'aria-label': 'uncontrolled-checkbox' }}
            checked={clientData.is_domain_active}
            onChange={handleChange}
          />
        </Grid>
        {clientData.is_domain_active && (
          <>
            <Grid item xs={4}>
              <Headding bold title={'Client Site URL'} />
            </Grid>
            <Grid item xs={8}>
              <Grid item xs={6}>
                <Input
                  placeholder="Enter website name"
                  type="text"
                  onChange={handleSiteNameChange}
                  value={clientData.domain_name}
                />
              </Grid>
              <Grid
                item
                xs={6}
                style={{ color: isWebsiteNameAvailable ? 'green' : 'red' }}
              >
                {isWebsiteNameAvailable &&
                  clientData.domain_name &&
                  clientData.domain_name.length > 0 && (
                    <Link
                      color="inherit"
                      onClick={() =>
                        window.open(
                          `http://${clientData.domain_name}.struct.services`,
                          '_blank'
                        )
                      }
                    >{`${clientData.domain_name}.struct.services`}</Link>
                  )}
                {!isWebsiteNameAvailable && (
                  <span>
                    {`${clientData.domain_name}.struct.services `}***Website
                    Name Already Taken***
                  </span>
                )}
              </Grid>
            </Grid>
          </>
        )}

        {isLoading && (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        )}

        {isClientSiteUpdated && (
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Configure Client site
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}
