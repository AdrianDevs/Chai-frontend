import { useEffect, useRef, useState } from 'react';

/**
 * @param url - The URL of the WebSocket server
 * @param retryAttempts - The number of times to retry the connection
 * @param retryInterval - The interval between retries (in milliseconds)
 */
type WebSocketHookProps = {
  url: string;
  retryAttempts: number;
  retryInterval: number;
};

type MessageData = {
  message: string;
  timestamp: number;
};

function useWebSocket({
  url,
  retryAttempts = 3,
  retryInterval = 1500,
}: WebSocketHookProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [data, setData] = useState<MessageData | null>(null);
  const [send, setSend] = useState<((message: string) => void) | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('WebSocket useEffect init');
    // Only create socket if it doesn't exist
    if (!socketRef.current) {
      console.log('WebSocket creating new socket');
      socketRef.current = new WebSocket(url);
    }

    const socket = socketRef.current;

    socket.onopen = () => {
      console.log('WebSocket connection opened');
      setIsConnected(true);

      // function to send messages
      setSend(() => {
        return (_data: { message: string; timestamp: number }) => {
          try {
            console.log('WebSocket sending message:', _data);
            socket.send(JSON.stringify(_data));
            return true;
          } catch (error) {
            console.error('Error sending message:', error);
            return false;
          }
        };
      });

      // receive messages
      socket.onmessage = (event: MessageEvent<string>) => {
        // console.log('WebSocket message received:', event.data);
        const messageData = formatMessage(event.data);
        if (
          messageData.message.toLowerCase().includes('ping') ||
          messageData.message.toLowerCase().includes('pong')
        ) {
          return;
        }
        console.log('WebSocket message received:', event.data);
        // if the message is from the webSocket, don't set the data
        if (
          messageData.message
            .toLowerCase()
            .includes('[webSocket]'.toLowerCase())
        ) {
          return;
        }
        setData(messageData);
      };
    };

    // on close should update isConnected to false and retry connection
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      socketRef.current = null; // Clear the ref when connection is closed
      // retry connection
      if (retryAttempt < retryAttempts) {
        setTimeout(() => {
          setRetryAttempt(retryAttempt + 1);
        }, retryInterval);
      }
    };

    socket.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
      setIsConnected(false);
      socketRef.current?.close();
      socketRef.current = null; // Clear the ref when connection is closed
    };

    // terminate connection on unmount
    return () => {
      console.log('WebSocket terminating connection');
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [retryAttempt, retryAttempts, retryInterval, url]);

  return { send, data, isConnected };
}

export default useWebSocket;

function formatMessage(data: string) {
  try {
    // First try to parse as JSON
    const parsedData = JSON.parse(data) as MessageData | string | null;

    // Check if it matches our MessageData structure
    if (
      typeof parsedData === 'object' &&
      parsedData !== null &&
      'message' in parsedData &&
      'timestamp' in parsedData
    ) {
      return parsedData;
    }

    // If it's valid JSON but doesn't match our structure,
    // treat it as a plain message
    return {
      message:
        typeof parsedData === 'string'
          ? parsedData
          : JSON.stringify(parsedData),
      timestamp: Date.now(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // If it's not valid JSON, treat it as a plain string message
    // console.error('Error formatting message:', error);
    return {
      message: data,
      timestamp: Date.now(),
    };
  }
}
