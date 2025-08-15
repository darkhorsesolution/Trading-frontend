import React from 'react';
import { Container, Title, Space } from '@mantine/core';
import { WebSocketLogin } from '@/components/WebSocketLogin';

const WebSocketDemoPage: React.FC = () => {
  return (
    <Container size="lg" py="xl">
      <Title order={1} align="center" mb="xl">
        WebSocket Trading Demo
      </Title>
      
      <WebSocketLogin />
      
      <Space h="xl" />
    </Container>
  );
};

// This page doesn't require authentication
WebSocketDemoPage.auth = false;

export default WebSocketDemoPage;