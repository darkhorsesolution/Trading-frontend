import React, { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Stack,
  Alert,
  Badge,
  Group,
  Text,
  Card,
  Grid,
  NumberInput,
  MultiSelect,
} from '@mantine/core';
import { useWebSocketAuth } from '@/hooks/useWebSocketAuth';
import { useMarketData } from '@/hooks/useMarketData';
import { IconCheck, IconX, IconRefresh } from '@tabler/icons';

const AVAILABLE_SYMBOLS = [
  'EUR/USD',
  'USD/JPY',
  'GBP/USD',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
];

export const WebSocketLogin: React.FC = () => {
  const [account, setAccount] = useState('TESTPRATIK');
  const [password, setPassword] = useState('TESTPRATIK');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['EUR/USD', 'USD/JPY']);

  const {
    isConnected,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    connectionStatus,
    token,
  } = useWebSocketAuth();

  const {
    marketData,
    subscribedSymbols,
    subscribe,
    unsubscribe,
    getBestBid,
    getBestAsk,
    getSpread,
    getMidPrice,
  } = useMarketData();

  const handleLogin = async () => {
    const success = await login(account, password);
    if (success) {
      // Auto-subscribe to selected symbols after login
      setTimeout(() => {
        subscribe(selectedSymbols);
      }, 500);
    }
  };

  const handleSubscribe = () => {
    subscribe(selectedSymbols);
  };

  const handleUnsubscribe = () => {
    unsubscribe(selectedSymbols);
  };

  const renderMarketDataCard = (symbol: string) => {
    const data = marketData.get(symbol);
    const bid = getBestBid(symbol);
    const ask = getBestAsk(symbol);
    const spread = getSpread(symbol);
    const midPrice = getMidPrice(symbol);

    return (
      <Card key={symbol} shadow="sm" padding="lg" radius="md" withBorder>
        <Group position="apart" mb="xs">
          <Text weight={500} size="lg">{symbol}</Text>
          <Badge color={data ? 'green' : 'gray'} variant="light">
            {data ? 'Live' : 'No Data'}
          </Badge>
        </Group>

        {data && (
          <Stack spacing="xs">
            <Group position="apart">
              <Text size="sm" color="dimmed">Bid:</Text>
              <Text size="sm" weight={500} color="red">
                {bid ? `${bid.price.toFixed(5)} (${bid.quantity.toLocaleString()})` : '-'}
              </Text>
            </Group>
            
            <Group position="apart">
              <Text size="sm" color="dimmed">Ask:</Text>
              <Text size="sm" weight={500} color="green">
                {ask ? `${ask.price.toFixed(5)} (${ask.quantity.toLocaleString()})` : '-'}
              </Text>
            </Group>
            
            <Group position="apart">
              <Text size="sm" color="dimmed">Spread:</Text>
              <Text size="sm" weight={500}>
                {spread ? (spread * 10000).toFixed(1) + ' pips' : '-'}
              </Text>
            </Group>
            
            <Group position="apart">
              <Text size="sm" color="dimmed">Mid Price:</Text>
              <Text size="sm" weight={500}>
                {midPrice ? midPrice.toFixed(5) : '-'}
              </Text>
            </Group>

            {data.bids && data.bids.length > 1 && (
              <div>
                <Text size="xs" color="dimmed" mb={5}>Market Depth (Bids):</Text>
                {data.bids.slice(0, 3).map((bid, idx) => (
                  <Text key={idx} size="xs" color="red">
                    Level {idx + 1}: {bid.p.toFixed(5)} @ {bid.q.toLocaleString()}
                  </Text>
                ))}
              </div>
            )}

            {data.offers && data.offers.length > 1 && (
              <div>
                <Text size="xs" color="dimmed" mb={5}>Market Depth (Asks):</Text>
                {data.offers.slice(0, 3).map((offer, idx) => (
                  <Text key={idx} size="xs" color="green">
                    Level {idx + 1}: {offer.p.toFixed(5)} @ {offer.q.toLocaleString()}
                  </Text>
                ))}
              </div>
            )}
          </Stack>
        )}
      </Card>
    );
  };

  return (
    <Stack spacing="md">
      {/* Connection Status */}
      <Paper shadow="xs" p="md" radius="md">
        <Group position="apart">
          <Group>
            <Text size="sm" weight={500}>WebSocket Status:</Text>
            <Badge
              color={isConnected ? 'green' : 'red'}
              variant="filled"
              leftSection={isConnected ? <IconCheck size={12} /> : <IconX size={12} />}
            >
              {connectionStatus}
            </Badge>
          </Group>
          
          {isAuthenticated && (
            <Group>
              <Text size="sm" weight={500}>Authentication:</Text>
              <Badge color="green" variant="filled" leftSection={<IconCheck size={12} />}>
                Authenticated
              </Badge>
            </Group>
          )}
        </Group>

        {token && (
          <Text size="xs" color="dimmed" mt="xs">
            Token: {token.substring(0, 8)}...
          </Text>
        )}
      </Paper>

      {/* Login Form */}
      {!isAuthenticated ? (
        <Paper shadow="xs" p="xl" radius="md">
          <Title order={3} mb="md">WebSocket Login</Title>
          
          <Stack spacing="md">
            <TextInput
              label="Account"
              placeholder="Enter account"
              value={account}
              onChange={(e) => setAccount(e.currentTarget.value)}
              required
            />
            
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            
            {error && (
              <Alert color="red" title="Error">
                {error}
              </Alert>
            )}
            
            <Button
              fullWidth
              loading={isLoading}
              disabled={!isConnected || !account || !password}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          {/* Market Data Subscription */}
          <Paper shadow="xs" p="xl" radius="md">
            <Title order={3} mb="md">Market Data Subscription</Title>
            
            <Stack spacing="md">
              <MultiSelect
                label="Select Symbols"
                placeholder="Choose symbols to subscribe"
                data={AVAILABLE_SYMBOLS}
                value={selectedSymbols}
                onChange={setSelectedSymbols}
                searchable
              />
              
              <Group>
                <Button
                  onClick={handleSubscribe}
                  disabled={selectedSymbols.length === 0}
                  leftIcon={<IconRefresh size={16} />}
                >
                  Subscribe
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleUnsubscribe}
                  disabled={subscribedSymbols.size === 0}
                >
                  Unsubscribe All
                </Button>
                
                <Button
                  variant="subtle"
                  color="red"
                  onClick={logout}
                >
                  Logout
                </Button>
              </Group>
              
              {subscribedSymbols.size > 0 && (
                <Text size="sm" color="dimmed">
                  Subscribed to: {Array.from(subscribedSymbols).join(', ')}
                </Text>
              )}
            </Stack>
          </Paper>

          {/* Market Data Display */}
          {subscribedSymbols.size > 0 && (
            <Paper shadow="xs" p="xl" radius="md">
              <Title order={3} mb="md">Live Market Data</Title>
              
              <Grid>
                {Array.from(subscribedSymbols).map(symbol => (
                  <Grid.Col key={symbol} span={6}>
                    {renderMarketDataCard(symbol)}
                  </Grid.Col>
                ))}
              </Grid>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
};

export default WebSocketLogin;