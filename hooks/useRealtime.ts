import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth/login';

interface RealtimeMessage {
  type: string;
  data: any;
  timestamp: string;
}

export const useRealtime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);

  const connect = useCallback(() => {
    const session = getSession();
    const userId = (session as any)?.username || 'anonymous';

    const eventSource = new EventSource(
      `/api/realtime/events?userId=${encodeURIComponent(userId)}`
    );

    eventSource.onopen = () => {
      console.log('Real-time connection established');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
        setLastMessage(message);
        
        // Handle specific message types
        switch (message.type) {
          case 'PART_LIST_SAVED':
            console.log('New part list saved:', message.data);
            // Trigger custom event for other components
            window.dispatchEvent(new CustomEvent('partListSaved', { 
              detail: message.data 
            }));
            break;
          case 'PART_LIST_UPDATED':
            console.log('Part list updated:', message.data);
            window.dispatchEvent(new CustomEvent('partListUpdated', { 
              detail: message.data 
            }));
            break;
          case 'PART_LIST_DELETED':
            console.log('Part list deleted:', message.data);
            window.dispatchEvent(new CustomEvent('partListDeleted', { 
              detail: message.data 
            }));
            break;
          case 'CONNECTION_ESTABLISHED':
            console.log('Connection confirmed:', message.data);
            break;
        }
      } catch (error) {
        console.error('Error parsing real-time message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real-time connection error:', error);
      setIsConnected(false);
      
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (!isConnected) {
          connect();
        }
      }, 3000);
    };

    return () => {
      eventSource.close();
    };
  }, [isConnected]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  return {
    isConnected,
    messages,
    lastMessage,
    clearMessages
  };
};
