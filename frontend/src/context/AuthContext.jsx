import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create a context for authentication
const AuthContext = createContext(null);

/**
 * Provides authentication state and functions to its children.
 * It uses localStorage to persist the login state across page reloads
 * since the backend is stateless.
 */
export const AuthProvider = ({ children }) => {
    const [userEmail, setUserEmail] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // On initial app load, check localStorage for a saved user session
    useEffect(() => {
        try {
            const storedEmail = localStorage.getItem('userEmail');
            if (storedEmail) {
                setUserEmail(storedEmail);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Could not access local storage:", error);
        } finally {
            // Stop loading once the check is complete
            setIsLoading(false);
        }
    }, []);

    // Function to set user state and save to localStorage upon successful login
    const login = (email) => {
        setUserEmail(email);
        setIsAuthenticated(true);
        localStorage.setItem('userEmail', email);
    };

    // Function to clear user state and remove from localStorage
    const logout = () => {
        setUserEmail(null);
        setIsAuthenticated(false);
        localStorage.removeItem('userEmail');
        // Redirect to the homepage after logging out
        navigate('/');
    };

    const authContextValue = {
        userEmail,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    // Render children only after the initial check is complete to avoid flicker
    return (
        <AuthContext.Provider value={authContextValue}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily access the auth context from any component
export const useAuth = () => {
    return useContext(AuthContext);
};
