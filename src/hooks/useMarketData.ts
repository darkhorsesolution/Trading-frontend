import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { MarketDataTick } from '@/services/WebSocketService';

interface UseMarketDataReturn {
  marketData: Map<string, MarketDataTick>;
  subscribedSymbols: Set<string>;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  getSymbolData: (symbol: string) => MarketDataTick | undefined;
  getBestBid: (symbol: string) => { price: number; quantity: number } | null;
  getBestAsk: (symbol: string) => { price: number; quantity: number } | null;
  getSpread: (symbol: string) => number | null;
  getMidPrice: (symbol: string) => number | null;
}

export const useMarketData = (autoSubscribeSymbols?: string[]): UseMarketDataReturn => {
  const {
    marketData,
    subscribeToMarketData,
    unsubscribeFromMarketData,
    isAuthenticated,
  } = useWebSocketContext();

  const [subscribedSymbols, setSubscribedSymbols] = useState<Set<string>>(new Set());

  // Auto-subscribe to symbols on mount if authenticated
  useEffect(() => {
    if (autoSubscribeSymbols && autoSubscribeSymbols.length > 0 && isAuthenticated) {
      subscribe(autoSubscribeSymbols);
      
      // Cleanup: unsubscribe on unmount
      return () => {
        unsubscribe(autoSubscribeSymbols);
      };
    }
  }, [isAuthenticated]); // Only re-run when authentication status changes

  const subscribe = useCallback((symbols: string[]) => {
    if (!isAuthenticated) {
      console.warn('Cannot subscribe to market data: not authenticated');
      return;
    }

    const newSymbols = symbols.filter(s => !subscribedSymbols.has(s));
    
    if (newSymbols.length > 0) {
      subscribeToMarketData(newSymbols);
      setSubscribedSymbols(prev => {
        const newSet = new Set(prev);
        newSymbols.forEach(s => newSet.add(s));
        return newSet;
      });
    }
  }, [isAuthenticated, subscribedSymbols, subscribeToMarketData]);

  const unsubscribe = useCallback((symbols: string[]) => {
    const symbolsToUnsubscribe = symbols.filter(s => subscribedSymbols.has(s));
    
    if (symbolsToUnsubscribe.length > 0) {
      unsubscribeFromMarketData(symbolsToUnsubscribe);
      setSubscribedSymbols(prev => {
        const newSet = new Set(prev);
        symbolsToUnsubscribe.forEach(s => newSet.delete(s));
        return newSet;
      });
    }
  }, [subscribedSymbols, unsubscribeFromMarketData]);

  const getSymbolData = useCallback((symbol: string): MarketDataTick | undefined => {
    return marketData.get(symbol);
  }, [marketData]);

  const getBestBid = useCallback((symbol: string): { price: number; quantity: number } | null => {
    const data = marketData.get(symbol);
    if (!data || !data.bids || data.bids.length === 0) return null;
    
    return {
      price: data.bids[0].p,
      quantity: data.bids[0].q,
    };
  }, [marketData]);

  const getBestAsk = useCallback((symbol: string): { price: number; quantity: number } | null => {
    const data = marketData.get(symbol);
    if (!data || !data.offers || data.offers.length === 0) return null;
    
    return {
      price: data.offers[0].p,
      quantity: data.offers[0].q,
    };
  }, [marketData]);

  const getSpread = useCallback((symbol: string): number | null => {
    const bid = getBestBid(symbol);
    const ask = getBestAsk(symbol);
    
    if (!bid || !ask) return null;
    
    return ask.price - bid.price;
  }, [getBestBid, getBestAsk]);

  const getMidPrice = useCallback((symbol: string): number | null => {
    const bid = getBestBid(symbol);
    const ask = getBestAsk(symbol);
    
    if (!bid || !ask) return null;
    
    return (bid.price + ask.price) / 2;
  }, [getBestBid, getBestAsk]);

  return {
    marketData,
    subscribedSymbols,
    subscribe,
    unsubscribe,
    getSymbolData,
    getBestBid,
    getBestAsk,
    getSpread,
    getMidPrice,
  };
};

export default useMarketData;