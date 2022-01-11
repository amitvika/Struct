import React from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AlertContext = React.createContext({
  openSuccessAlert: () => {},
  openErrorAlert: () => {}
});

export const AlertContextProvider = ({ children }) => {
  const [alertValue, setAlertValue] = React.useState({
    openAlert: false,
    message: '',
    severity: 'success'
  });

  const handleClose = () => {
    setAlertValue({ openAlert: false });
  };

  const alertMode = React.useMemo(
    () => ({
      openSuccessAlert: ({ message }) =>
        setAlertValue({ message, openAlert: true, severity: 'success' }),
      openErrorAlert: ({ message }) =>
        setAlertValue({ message, openAlert: true, severity: 'error' })
    }),
    []
  );

  return (
    <AlertContext.Provider value={alertMode}>
      <Snackbar
        open={alertValue.openAlert}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={alertValue.severity}
          sx={{ width: '100%' }}
        >
          {alertValue.message}!
        </Alert>
      </Snackbar>
      {children}
    </AlertContext.Provider>
  );
};
