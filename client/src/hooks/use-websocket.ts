import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectWebSocket } from '@/lib/websocket';

export function useWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = connectWebSocket();
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'market-data-update':
            // Invalidate market data queries
            queryClient.invalidateQueries({ queryKey: ['/api/market-data'] });
            queryClient.invalidateQueries({ queryKey: ['/api/market-data/gainers'] });
            queryClient.invalidateQueries({ queryKey: ['/api/market-data/losers'] });
            break;
            
          case 'new-article':
            // Invalidate article queries
            queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
            break;
            
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
}
