import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { logout, selectCurrentToken } from '../features/auth/authSlice';
import { useRefreshTokenMutation, useUpdateActivityMutation, useLogoutMutation } from '../features/auth/authApiSlice';

const SessionContext = createContext(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isUIFrozen, setIsUIFrozen] = useState(false);
  const [refreshToken] = useRefreshTokenMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [logoutMutation] = useLogoutMutation();

  // Handle session expiration
  const handleSessionExpired = useCallback(async () => {
    if (isSessionExpired) return; // Prevent multiple calls

    setIsSessionExpired(true);
    setIsUIFrozen(true);

    // Dispatch logout to clear Redux state
    dispatch(logout());
  }, [dispatch, isSessionExpired]);

  // Handle user becoming active again
  const handleActive = useCallback(() => {
    if (!token) return;

    // Update activity on backend
    updateActivity().catch(error => {
      console.error('Failed to update activity:', error);
    });
  }, [token, updateActivity]);

  // Idle timer hook
  useIdleTimer({
    timeout: 15 * 60 * 1000, // 15 minutes
    onIdle: handleSessionExpired,
    onActive: handleActive,
    enabled: !!token && !isSessionExpired // Only enabled when logged in and session not expired
  });

  // Auto-refresh access token before it expires
  useEffect(() => {
    if (!token || isSessionExpired) return;

    // Refresh token every 4 minutes (before 5-minute expiry)
    const refreshInterval = setInterval(async () => {
      try {
        const result = await refreshToken().unwrap();
        if (result?.data?.accessToken) {
          // Update token in Redux store
          dispatch({
            type: 'auth/setCredentials',
            payload: {
              user: JSON.parse(localStorage.getItem('user')),
              token: result.data.accessToken
            }
          });
        }
      } catch (error) {
        // If refresh fails, session expired
        if (error?.data?.code === 'SESSION_EXPIRED') {
          handleSessionExpired();
        }
      }
    }, 4 * 60 * 1000); // Every 4 minutes

    return () => clearInterval(refreshInterval);
  }, [token, isSessionExpired, refreshToken, dispatch, handleSessionExpired]);

  // Update activity on mount and when token changes
  useEffect(() => {
    if (token && !isSessionExpired) {
      updateActivity().catch(console.error);
    }
  }, [token, isSessionExpired, updateActivity]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      setIsSessionExpired(false);
      setIsUIFrozen(false);
    }
  }, [logoutMutation, dispatch]);

  // Restore session state after login (no longer using encryption)
  const restoreSessionState = useCallback(async () => {
    // State restoration removed - no longer saving encrypted state
    return null;
  }, []);

  const value = {
    isSessionExpired,
    isUIFrozen,
    setIsUIFrozen,
    handleLogout,
    restoreSessionState
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

