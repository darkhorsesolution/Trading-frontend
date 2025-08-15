import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWebSocketAuth } from '@/hooks/useWebSocketAuth';
import { LoadingOverlay, Center, Text } from '@mantine/core';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isConnected, connectionStatus } = useWebSocketAuth();

  useEffect(() => {
    // Check if user is authenticated
    const wsAuthenticated = localStorage.getItem('ws_authenticated') === 'true';
    const wsToken = localStorage.getItem('ws_token');
    
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && !wsAuthenticated && !wsToken) {
      if (router.pathname !== '/auth/signin' && router.pathname !== '/websocket-demo') {
        router.push('/auth/signin');
      }
    }
  }, [isAuthenticated, router]);

  // Show loading while checking authentication
  if (!isConnected && router.pathname !== '/auth/signin') {
    return (
      <Center style={{ height: '100vh' }}>
        <div>
          <LoadingOverlay visible={true} />
          <Text>Connecting to WebSocket... {connectionStatus}</Text>
        </div>
      </Center>
    );
  }

  // If on protected route and not authenticated, show loading (will redirect)
  if (!isAuthenticated && router.pathname !== '/auth/signin' && router.pathname !== '/websocket-demo') {
    const wsAuthenticated = localStorage.getItem('ws_authenticated') === 'true';
    if (!wsAuthenticated) {
      return (
        <Center style={{ height: '100vh' }}>
          <Text>Redirecting to login...</Text>
        </Center>
      );
    }
  }

  return <>{children}</>;
};

export default AuthGuard;