import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

/**
 * @param url - The URL of the WebSocket server
 * @param retryAttempts - The number of times to retry the connection
 * @param retryInterval - The interval between retries (in milliseconds)
 */
type WebSocketHookProps = {
  url: string;
  retryAttempts: number;
  retryInterval: number;
  // token: string;
};

type MessageData = {
  message: string;
  timestamp: number;
};

function useWebSocket({
  url,
  retryAttempts = 3,
  retryInterval = 1500,
  // token,
}: WebSocketHookProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [data, setData] = useState<MessageData | null>(null);
  const [send, setSend] = useState<((message: string) => void) | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const auth = useAuth();

  useEffect(() => {
    console.log('[WebSocket] useEffect init');
    // Only create socket if it doesn't exist
    if (!socketRef.current) {
      const fullUrl = `${url}?userID=${auth.user?.id}&token=${auth.user?.webSocketToken}`;
      console.log('[WebSocket] creating new socket with url', fullUrl);
      socketRef.current = new WebSocket(fullUrl);
    }

    const socket = socketRef.current;

    socket.onopen = () => {
      console.log('[WebSocket] connection opened');

      // Send an initial payload with websocket token
      socket.send(
        JSON.stringify({
          type: 'authenticate',
          token: auth.user?.jwt ?? '',
          timestamp: Date.now(),
          message: 'websocket client connection request',
        })
      );

      setIsConnected(true);

      // function to send messages
      setSend(() => {
        return (_data: { message: string }) => {
          try {
            console.log('[WebSocket] sending message:', _data);

            const dataWithAuth = {
              type: 'message',
              token: auth.user?.jwt ?? '',
              timestamp: Date.now(),
              message: _data,
            };

            socket.send(JSON.stringify(dataWithAuth));
            return true;
          } catch (error) {
            console.error('[WebSocket] error sending message:', error);
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
        console.log('[WebSocket] message received:', event.data);

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

    socket.onmessage = (event: MessageEvent<string>) => {
      console.log('[WebSocket] message received:', event.data);
    };

    // on close should update isConnected to false and retry connection
    socket.onclose = async (event: CloseEvent) => {
      console.log('[WebSocket] connection closed', event);
      setIsConnected(false);
      socketRef.current = null; // Clear the ref when connection is closed

      // connection closed with code 1006 likely due to token expiration
      if (event.code === 1006) {
        console.log(
          '[WebSocket] connection closed with code 1006 likely due to token expiration'
        );
        // Check if refresh token is expired
        const tokenExpiryEpoch = auth.user?.webSocketTokenExpiryEpoch;
        if (tokenExpiryEpoch) {
          const currentEpoch = Date.now();
          if (currentEpoch > tokenExpiryEpoch) {
            console.log('[WebSocket] refresh token is expired');
            // refresh token
            const userID = auth.user?.id;
            if (userID) {
              console.log('[WebSocket] refreshing token');
              await auth.update();
              // const newTokensResponse = await API.refreshTokens(userID);
              // if (newTokensResponse.data) {
              //   console.log('[WebSocket] new tokens received');
              //   updateStoredUser(newTokensResponse.data);
              // }
            }
          }
        } else {
          console.log('[WebSocket] no refresh token found');
        }

        setIsConnected(false);
        socketRef.current = null; // Clear the ref when connection is closed
      }

      // retry connection
      if (retryAttempt < retryAttempts) {
        console.log('[WebSocket] retrying connection');
        setTimeout(() => {
          setRetryAttempt(retryAttempt + 1);
        }, retryInterval);
      }
    };

    socket.onerror = (event: Event) => {
      console.error('[WebSocket] error:', event);
      setIsConnected(false);
      socketRef.current?.close();
      socketRef.current = null; // Clear the ref when connection is closed
    };

    // terminate connection on unmount
    return () => {
      console.log('[WebSocket] terminating connection');
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [
    auth,
    auth.user?.id,
    auth.user?.webSocketToken,
    auth.user?.webSocketTokenExpiryEpoch,
    retryAttempt,
    retryAttempts,
    retryInterval,
    url,
  ]);

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
