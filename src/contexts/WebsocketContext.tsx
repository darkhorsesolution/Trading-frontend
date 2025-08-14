import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import WebSocketService, { WebSocketMessage, LogonResponse, MarketDataTick } from '@/services/WebSocketService';
import { showNotification } from '@mantine/notifications';

interface WebSocketContextType {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<any> | null;
  readyState: ReadyState;
  isAuthenticated: boolean;
  token: string | null;
  login: (account: string, password: string) => Promise<boolean>;
  logout: () => void;
  subscribeToMarketData: (symbols: string[]) => void;
  unsubscribeFromMarketData: (symbols: string[]) => void;
  marketData: Map<string, MarketDataTick>;
  connectionStatus: string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  enabled?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  url = 'ws://192.54.136.152:8090/ws/websocket',
  enabled = true 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<Map<string, MarketDataTick>>(new Map());
  const loginPromiseRef = useRef<{
    resolve: (value: boolean) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    enabled ? url : null,
    {
      onOpen: () => {
        console.log('WebSocket connected');
        showNotification({
          title: 'Connection',
          message: 'WebSocket connected successfully',
          color: 'green',
        });

        // Check for existing token and re-authenticate if needed
        const existingToken = WebSocketService.getToken();
        if (existingToken) {
          setToken(existingToken);
          setIsAuthenticated(true);
        }
      },
      onClose: () => {
        console.log('WebSocket disconnected');
        showNotification({
          title: 'Connection',
          message: 'WebSocket disconnected',
          color: 'orange',
        });
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        showNotification({
          title: 'Connection Error',
          message: 'Failed to connect to WebSocket',
          color: 'red',
        });
      },
      shouldReconnect: () => true,
      reconnectInterval: 3000,
      reconnectAttempts: 10,
    }
  );

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      const message = WebSocketService.parseMessage(lastMessage.data);
      
      if (!message) return;

      console.log('Received message:', message);

      switch (message.subject) {
        case 'logonResponse':
          handleLogonResponse(message);
          break;
        
        case 't': // Market data tick
          handleMarketDataTick(message);
          break;
        
        case 'orderResponse':
          handleOrderResponse(message);
          break;
        
        case 'error':
          handleErrorMessage(message);
          break;
        
        default:
          console.log('Unhandled message subject:', message.subject);
      }
    }
  }, [lastMessage]);

  const handleLogonResponse = (message: WebSocketMessage) => {
    const response = WebSocketService.handleLogonResponse(message);
    
    if (response) {
      if (response.status) {
        setToken(response.token);
        setIsAuthenticated(true);
        
        showNotification({
          title: 'Authentication',
          message: 'Successfully logged in',
          color: 'green',
        });

        // Resolve login promise if it exists
        if (loginPromiseRef.current) {
          loginPromiseRef.current.resolve(true);
          loginPromiseRef.current = null;
        }
      } else {
        showNotification({
          title: 'Authentication Failed',
          message: response.message || 'Invalid credentials',
          color: 'red',
        });

        // Reject login promise if it exists
        if (loginPromiseRef.current) {
          loginPromiseRef.current.resolve(false);
          loginPromiseRef.current = null;
        }
      }
    }
  };

  const handleMarketDataTick = (message: WebSocketMessage) => {
    if (message.obj) {
      const tick = message.obj as MarketDataTick;
      setMarketData(prev => {
        const newData = new Map(prev);
        newData.set(tick.symbol, tick);
        return newData;
      });
    }
  };

  const handleOrderResponse = (message: WebSocketMessage) => {
    // Handle order responses
    console.log('Order response:', message.obj);
    
    showNotification({
      title: 'Order Update',
      message: `Order ${message.obj.status || 'processed'}`,
      color: message.obj.status === 'filled' ? 'green' : 'blue',
    });
  };

  const handleErrorMessage = (message: WebSocketMessage) => {
    console.error('Error message:', message.obj);
    
    showNotification({
      title: 'Error',
      message: message.obj.message || 'An error occurred',
      color: 'red',
    });
  };

  const login = useCallback((account: string, password: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (readyState !== ReadyState.OPEN) {
        showNotification({
          title: 'Connection Error',
          message: 'WebSocket is not connected',
          color: 'red',
        });
        resolve(false);
        return;
      }

      // Store promise handlers
      loginPromiseRef.current = { resolve, reject };

      // Send login message
      const loginMessage = WebSocketService.createLogonMessage(account, password);
      sendMessage(loginMessage);

      // Set a timeout for login response
      setTimeout(() => {
        if (loginPromiseRef.current) {
          loginPromiseRef.current.resolve(false);
          loginPromiseRef.current = null;
          
          showNotification({
            title: 'Login Timeout',
            message: 'Login request timed out',
            color: 'red',
          });
        }
      }, 10000); // 10 second timeout
    });
  }, [readyState, sendMessage]);

  const logout = useCallback(() => {
    WebSocketService.clearToken();
    setToken(null);
    setIsAuthenticated(false);
    setMarketData(new Map());
    
    // Optionally send logout message to server
    if (token && readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({
        token,
        subject: 'logout',
        obj: {}
      }));
    }
    
    showNotification({
      title: 'Logged Out',
      message: 'Successfully logged out',
      color: 'blue',
    });
  }, [token, readyState, sendMessage]);

  const subscribeToMarketData = useCallback((symbols: string[]) => {
    if (!isAuthenticated || !token) {
      showNotification({
        title: 'Authentication Required',
        message: 'Please login before subscribing to market data',
        color: 'orange',
      });
      return;
    }

    if (readyState !== ReadyState.OPEN) {
      showNotification({
        title: 'Connection Error',
        message: 'WebSocket is not connected',
        color: 'red',
      });
      return;
    }

    try {
      const mdRequest = WebSocketService.createMarketDataRequest(symbols);
      sendMessage(mdRequest);
      
      console.log('Subscribed to symbols:', symbols);
    } catch (error) {
      console.error('Failed to subscribe to market data:', error);
      showNotification({
        title: 'Subscription Error',
        message: 'Failed to subscribe to market data',
        color: 'red',
      });
    }
  }, [isAuthenticated, token, readyState, sendMessage]);

  const unsubscribeFromMarketData = useCallback((symbols: string[]) => {
    if (!isAuthenticated || !token) return;
    
    if (readyState !== ReadyState.OPEN) return;

    const message = JSON.stringify({
      token,
      subject: 'mdRequest',
      obj: {
        subscribe: false,
        symbols
      }
    });
    
    sendMessage(message);
    
    // Remove symbols from local market data
    setMarketData(prev => {
      const newData = new Map(prev);
      symbols.forEach(symbol => newData.delete(symbol));
      return newData;
    });
  }, [isAuthenticated, token, readyState, sendMessage]);

  const connectionStatus = WebSocketService.getConnectionStateString(readyState);

  const contextValue: WebSocketContextType = {
    sendMessage,
    lastMessage,
    readyState,
    isAuthenticated,
    token,
    login,
    logout,
    subscribeToMarketData,
    unsubscribeFromMarketData,
    marketData,
    connectionStatus,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;