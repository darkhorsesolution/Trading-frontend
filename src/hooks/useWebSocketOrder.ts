import { useState, useCallback } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import WebSocketService from '@/services/WebSocketService';
import { showNotification } from '@mantine/notifications';

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'DAY';
  clientOrderId?: string;
}

export interface OrderResponse {
  orderId: string;
  clientOrderId?: string;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED';
  executedQty?: number;
  executedPrice?: number;
  message?: string;
}

interface UseWebSocketOrderReturn {
  placeOrder: (order: OrderRequest) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  modifyOrder: (orderId: string, modifications: Partial<OrderRequest>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  lastOrderResponse: OrderResponse | null;
}

export const useWebSocketOrder = (): UseWebSocketOrderReturn => {
  const { sendMessage, isAuthenticated, token } = useWebSocketContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderResponse, setLastOrderResponse] = useState<OrderResponse | null>(null);

  const placeOrder = useCallback(async (order: OrderRequest): Promise<void> => {
    if (!isAuthenticated || !token) {
      const errorMsg = 'Must be authenticated to place orders';
      setError(errorMsg);
      showNotification({
        title: 'Order Error',
        message: errorMsg,
        color: 'red',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate client order ID if not provided
      const clientOrderId = order.clientOrderId || `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const orderMessage = {
        token,
        subject: 'orderRequest',
        obj: {
          ...order,
          clientOrderId,
          action: 'NEW',
        }
      };

      sendMessage(JSON.stringify(orderMessage));

      showNotification({
        title: 'Order Sent',
        message: `${order.side} ${order.quantity} ${order.symbol} @ ${order.type}`,
        color: 'blue',
      });

      // Note: The actual order response will come through the WebSocket message handler
      // You might want to implement a promise-based response system with timeout
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setError(errorMessage);
      showNotification({
        title: 'Order Failed',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, sendMessage]);

  const cancelOrder = useCallback(async (orderId: string): Promise<void> => {
    if (!isAuthenticated || !token) {
      const errorMsg = 'Must be authenticated to cancel orders';
      setError(errorMsg);
      showNotification({
        title: 'Cancel Error',
        message: errorMsg,
        color: 'red',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cancelMessage = {
        token,
        subject: 'orderRequest',
        obj: {
          orderId,
          action: 'CANCEL',
        }
      };

      sendMessage(JSON.stringify(cancelMessage));

      showNotification({
        title: 'Cancel Request Sent',
        message: `Cancelling order ${orderId}`,
        color: 'orange',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMessage);
      showNotification({
        title: 'Cancel Failed',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, sendMessage]);

  const modifyOrder = useCallback(async (
    orderId: string,
    modifications: Partial<OrderRequest>
  ): Promise<void> => {
    if (!isAuthenticated || !token) {
      const errorMsg = 'Must be authenticated to modify orders';
      setError(errorMsg);
      showNotification({
        title: 'Modify Error',
        message: errorMsg,
        color: 'red',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const modifyMessage = {
        token,
        subject: 'orderRequest',
        obj: {
          orderId,
          action: 'MODIFY',
          ...modifications,
        }
      };

      sendMessage(JSON.stringify(modifyMessage));

      showNotification({
        title: 'Modify Request Sent',
        message: `Modifying order ${orderId}`,
        color: 'blue',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to modify order';
      setError(errorMessage);
      showNotification({
        title: 'Modify Failed',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, sendMessage]);

  return {
    placeOrder,
    cancelOrder,
    modifyOrder,
    isLoading,
    error,
    lastOrderResponse,
  };
};

export default useWebSocketOrder;