import React from 'react';

export const AppDesignerContext = React.createContext({});

export const AppDesignerContextProvider = ({ children }) => {
  const [appDesigner, setAppDesigner] = React.useState({});

  return (
    <AppDesignerContext.Provider value={{ appDesigner, setAppDesigner }}>
      {children}
    </AppDesignerContext.Provider>
  );
}
