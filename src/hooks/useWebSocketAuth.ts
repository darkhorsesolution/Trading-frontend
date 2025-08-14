import { useState, useEffect, useCallback } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { ReadyState } from 'react-use-websocket';

interface UseWebSocketAuthReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (account: string, password: string) => Promise<boolean>;
  logout: () => void;
  connectionStatus: string;
  token: string | null;
}

export const useWebSocketAuth = (): UseWebSocketAuthReturn => {
  const {
    readyState,
    isAuthenticated,
    token,
    login: wsLogin,
    logout: wsLogout,
    connectionStatus,
  } = useWebSocketContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = readyState === ReadyState.OPEN;

  const login = useCallback(async (account: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await wsLogin(account, password);
      
      if (!success) {
        setError('Login failed. Please check your credentials.');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wsLogin]);

  const logout = useCallback(() => {
    setError(null);
    wsLogout();
  }, [wsLogout]);

  // Auto-reconnect logic
  useEffect(() => {
    if (isConnected && token && !isAuthenticated) {
      // If we have a token but not authenticated, try to re-authenticate
      console.log('Attempting to re-authenticate with existing token');
    }
  }, [isConnected, token, isAuthenticated]);

  return {
    isConnected,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    connectionStatus,
    token,
  };
};

export default useWebSocketAuth;