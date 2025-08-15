import React, { useEffect, useRef } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useMarketData } from '@/hooks/useMarketData';
import { useAppDispatch } from '@/pages/_app';
import { quotesActions } from '@/store/quotes';
import { IPriceTick, PriceChange } from '@/interfaces/IOrder';
import { MarketDataTick } from '@/services/WebSocketService';

interface WebSocketQuoteServiceProps {
  symbols?: string[];
}

export const WebSocketQuoteService: React.FC<WebSocketQuoteServiceProps> = ({ 
  symbols = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY']
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useWebSocketContext();
  const { marketData, subscribe } = useMarketData();
  
  // Store previous prices for change detection
  const previousPricesRef = useRef<{ [symbol: string]: { bid: number; ask: number } }>({});

  // Subscribe to market data when authenticated
  useEffect(() => {
    if (isAuthenticated && symbols.length > 0) {
      console.log('WebSocketQuoteService: Subscribing to symbols:', symbols);
      subscribe(symbols);
    }
  }, [isAuthenticated, symbols.join(',')]);

  // Convert WebSocket market data to Redux quotes format
  useEffect(() => {
    if (marketData.size > 0) {
      const quotesUpdate: { [key: string]: IPriceTick } = {};
      
      marketData.forEach((tick: MarketDataTick, symbol: string) => {
        const bestBid = tick.bids && tick.bids.length > 0 ? tick.bids[0] : null;
        const bestAsk = tick.offers && tick.offers.length > 0 ? tick.offers[0] : null;
        
        if (bestBid && bestAsk) {
          const currentBid = bestBid.p;
          const currentAsk = bestAsk.p;
          const midPrice = (currentBid + currentAsk) / 2;
          const spread = currentAsk - currentBid;
          
          // Determine price changes
          const previousPrices = previousPricesRef.current[symbol];
          let bidPriceChange = PriceChange.None;
          let askPriceChange = PriceChange.None;
          let priceChange = PriceChange.None;
          
          if (previousPrices) {
            // Bid price change
            if (currentBid > previousPrices.bid) {
              bidPriceChange = PriceChange.Up;
            } else if (currentBid < previousPrices.bid) {
              bidPriceChange = PriceChange.Down;
            }
            
            // Ask price change
            if (currentAsk > previousPrices.ask) {
              askPriceChange = PriceChange.Up;
            } else if (currentAsk < previousPrices.ask) {
              askPriceChange = PriceChange.Down;
            }
            
            // Overall price change (based on mid price)
            const previousMid = (previousPrices.bid + previousPrices.ask) / 2;
            if (midPrice > previousMid) {
              priceChange = PriceChange.Up;
            } else if (midPrice < previousMid) {
              priceChange = PriceChange.Down;
            }
          }
          
          // Store current prices for next comparison
          previousPricesRef.current[symbol] = { bid: currentBid, ask: currentAsk };
          
          quotesUpdate[symbol] = {
            symbol,
            datetime: new Date().toISOString(),
            bidPrice: currentBid.toString(),
            askPrice: currentAsk.toString(),
            price: midPrice.toString(),
            spread: spread.toFixed(5),
            priceChange,
            bidPriceChange,
            askPriceChange,
          };
          
          console.log(`WebSocketQuoteService: Updated ${symbol}:`, {
            bid: currentBid,
            ask: currentAsk,
            spread: spread.toFixed(5),
            bidChange: bidPriceChange,
            askChange: askPriceChange
          });
        }
      });
      
      if (Object.keys(quotesUpdate).length > 0) {
        dispatch(quotesActions.onUpdate(quotesUpdate));
      }
    }
  }, [marketData, dispatch]);

  // This component doesn't render anything - it's just a service
  return null;
};

export default WebSocketQuoteService;