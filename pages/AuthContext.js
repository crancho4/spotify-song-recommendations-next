import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken'); // Check if token exists
    if (token) {
      setIsAuthenticated(true); // Set authenticated state if token found
    }
  }, []);

  const login = () => {
    // Logic to handle login, e.g., setting token in localStorage
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Logic to handle logout
    setIsAuthenticated(false);
    localStorage.removeItem('spotifyToken');
  };
  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    console.log("Retrieved token:", token); // Log the retrieved token
    if (token) {
      setIsAuthenticated(true);
      console.log("User is authenticated"); // Log authentication status
    } else {
      console.log("User is not authenticated"); // Log non-authenticated status
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext); // Get context value
};


