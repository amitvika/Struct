import React from 'react';
import jwtDecode from 'jwt-decode';

export const AuthContext = React.createContext({});

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = React.useState({});

  React.useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    const { exp } = jwtDecode(token);
    const expirationTime = exp * 1000 - 60000;

    const timer = setInterval(() => {
      if (Date.now() >= expirationTime) {
        alert('Token Expired');
        localStorage.removeItem('token');
        window.location = '/';
      }
    }, 15000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
