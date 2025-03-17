import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import type { Message } from '../services/api/types';

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

export type WebSocketMessage = {
  type: 'authenticate' | 'message' | 'info' | 'error' | 'unknown';
  isValid: boolean;
  content: Message | string;
};

function useWebSocket({
  url,
  retryAttempts = 3,
  retryInterval = 1500,
  // token,
}: WebSocketHookProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [data, setData] = useState<Message | null>(null);
  const [send, setSend] = useState<((message: Message) => void) | null>(null);
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
        console.log('WebSocket message received:', event.data);

        const messageData = parseMessage(event.data);
        console.log('[WebSocket] messageData:', messageData);

        if (messageData.type === 'error') {
          console.error('[WebSocket] error message received:', messageData);
          return;
        }
        if (messageData.type === 'unknown') {
          console.error('[WebSocket] unknown message received:', messageData);
          return;
        }
        if (messageData.type === 'authenticate') {
          console.log(
            '[WebSocket] authenticate message received - do nothing:',
            messageData
          );
          return;
        }
        if (messageData.type === 'info') {
          console.log(
            '[WebSocket] info message received - do nothing:',
            messageData
          );
          return;
        }
        if (!messageData.isValid) {
          console.error('[WebSocket] invalid message received:', messageData);
          return;
        }

        const messageContent = parseMessageContent(messageData.content);
        console.log('[WebSocket] messageContent:', messageContent);
        if (messageContent.id < 0) {
          console.error('[WebSocket] invalid id:', messageContent);
          return;
        }

        if (messageContent.userId === auth.user?.id) {
          console.log('[WebSocket] message is from self, ignoring');
          return;
        }

        setData(messageContent);
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
        // Check if webSocket token or jwt token is expired
        const jwtTokenExpiryEpoch = auth.user?.expiryEpoch;
        const webSocketTokenExpiryEpoch = auth.user?.webSocketTokenExpiryEpoch;
        const userID = auth.user?.id;
        if (userID && jwtTokenExpiryEpoch && webSocketTokenExpiryEpoch) {
          const currentEpoch = Date.now();
          if (currentEpoch > webSocketTokenExpiryEpoch) {
            console.log(
              '[WebSocket] webSocket token is expired => refreshing tokens'
            );
            await auth.update();
          } else if (currentEpoch > jwtTokenExpiryEpoch) {
            console.log(
              '[WebSocket] jwt token is expired => refreshing tokens'
            );
            await auth.update();
          }
        } else {
          console.log('[WebSocket] no userID or tokens found');
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

function parseMessage(data: string) {
  try {
    // First try to parse as JSON
    const parsedData = JSON.parse(data) as WebSocketMessage | string | null;

    // Check if it matches our MessageData structure
    if (
      typeof parsedData === 'object' &&
      parsedData !== null &&
      'type' in parsedData &&
      'isValid' in parsedData &&
      'content' in parsedData
    ) {
      console.log(
        '[WebSocket][parseMessage] messageData is object:',
        parsedData
      );
      return parsedData;
    }

    // If it's valid JSON but doesn't match our structure,
    // treat it as a plain message
    return {
      content:
        typeof parsedData === 'string'
          ? parsedData
          : JSON.stringify(parsedData),
      isValid: false,
      type: 'unknown',
    } as WebSocketMessage;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // If it's not valid JSON, treat it as a plain string message
    // console.error('Error formatting message:', error);
    return {
      content: 'unknown',
      isValid: false,
      type: 'unknown',
    } as WebSocketMessage;
  }
}

function parseMessageContent(
  data: Message | string | null | undefined
): Message {
  // Check if it matches our MessageData structure
  console.log('[WebSocket][parseMessageContent] data:', data);

  if (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'content' in data &&
    'createdAt' in data &&
    'userId' in data &&
    'conversationId' in data
  ) {
    console.log('[WebSocket][parseMessage] messageConent is object:', data);
    return data;
  }

  if (typeof data === 'string') {
    console.log('[WebSocket][parseMessage] messageContent is string:', data);
    return {
      id: -1,
      content: data,
      createdAt: new Date(),
      userId: -1,
      conversationId: -1,
    };
  }

  return {
    id: -1,
    content: 'unknown',
    createdAt: new Date(),
    userId: -1,
    conversationId: -1,
  };
}
