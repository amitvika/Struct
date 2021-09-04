import React from 'react';

export const AuthContext = React.createContext({});

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = React.useState({});

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
}
