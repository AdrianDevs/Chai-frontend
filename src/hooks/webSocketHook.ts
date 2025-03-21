import { useCallback, useEffect, useRef, useState } from 'react';
import { parseWebSocketMessage } from '../utils/websocketUtils';
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
};

type NamedWebSocket = WebSocket & {
  name: string;
};

function useWebSocket({
  url,
  retryAttempts = 3,
  retryInterval = 1500,
}: WebSocketHookProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [data, setData] = useState<Message | null>(null);
  const socketRef = useRef<NamedWebSocket | null>(null);
  const auth = useAuth();

  const handleMessage = useCallback((event: MessageEvent<string>) => {
    const message = parseWebSocketMessage(event.data);

    switch (message.type) {
      case 'message':
        if (
          message.content &&
          typeof message.content === 'object' &&
          'userId' in message.content
        ) {
          const chatMessage = message.content as Message;
          setData(chatMessage);
        }
        break;
      case 'error':
        console.error(
          '[WebSocket] error message received:',
          message.content,
          message.message
        );
        break;
      case 'info':
        console.log('[WebSocket] info message received:', message.content);
        break;
      case 'authenticate':
        console.log(
          '[WebSocket] authenticate message received:',
          message.content
        );
        break;
      case 'unknown':
        console.warn('[WebSocket] unknown message received:', message.content);
        break;
      default:
        console.warn('[WebSocket] unknown message type received: unknown');
        break;
    }
  }, []);

  const connect = useCallback(() => {
    console.log('[WebSocket] === connect ===');
    // Don't create a new connection if we already have one
    if (
      socketRef.current?.readyState === WebSocket.OPEN ||
      socketRef.current?.readyState === WebSocket.CONNECTING
    ) {
      console.log('[WebSocket] connection already exists, skipping');
      return;
    }

    if (!auth.user?.id || !auth.user.webSocketToken) {
      console.log('[WebSocket] no auth user or token, skipping connection');
      return;
    }

    const fullUrl = `${url}?userID=${auth.user.id}&token=${auth.user.webSocketToken}`;
    console.log('[WebSocket] creating new socket with url', fullUrl);

    const socket = new WebSocket(fullUrl) as NamedWebSocket;
    socket.name = `${auth.user.id}-${Date.now()}`;
    socketRef.current = socket;
    console.log(`[WebSocket][${socket.name}] created new socket`);

    socket.onopen = () => {
      // If socket and socketRef.current are not the same, and socket is open,
      // and socketRef.current is either open or connecting, then we need to close the open socket
      if (
        socketRef.current &&
        socket !== socketRef.current &&
        socket.readyState === WebSocket.OPEN &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        console.log(
          `[WebSocket][${socket.name}] is a duplicate of ${socketRef.current.name}, closing duplicate webSocket`
        );
        socket.close();
        return;
      }
      setIsConnected(true);

      // Send authentication message
      const authMessage = {
        type: 'authenticate' as const,
        token: auth.user?.jwt ?? '',
        timestamp: Date.now(),
        message: 'websocket client connection request',
      };
      socket.send(JSON.stringify(authMessage));
    };

    socket.onmessage = handleMessage;

    socket.onclose = async (event) => {
      console.log(`[WebSocket][${socket.name}] connection closed`, event);
      // If the socketRef.current is not the same as the socket, then we need to skip the cleanup
      if (socketRef.current !== socket) {
        console.log(
          `[WebSocket][${socket.name}] socketRef.current is not the same as the socket, skipping cleanup`
        );
        return;
      }
      socketRef.current = null;
      setIsConnected(false);

      if (event.code === 1006) {
        console.warn(
          `[WebSocket][${socket.name}] connection closed with code 1006, checking tokens`,
          auth.user
        );
        const currentEpoch = Date.now();

        const isTokenExpired =
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          (auth.user?.expiryEpoch && currentEpoch > auth.user.expiryEpoch) ||
          (auth.user?.webSocketTokenExpiryEpoch &&
            currentEpoch > auth.user.webSocketTokenExpiryEpoch);

        if (isTokenExpired) {
          console.log(
            `[WebSocket][${socket.name}] user token expired, refreshing`
          );
          try {
            await auth.update();
            setRetryAttempt(0);
            return;
          } catch (error) {
            console.error('Failed to update user', error);
          }
        } else {
          console.log(
            `[WebSocket][${socket.name}] user token not expired, not refreshing`
          );
        }
      }

      if (retryAttempt < retryAttempts) {
        console.log(
          `[WebSocket] retrying connection in ${retryInterval}ms (${retryAttempt + 1}/${retryAttempts})`
        );
        setTimeout(() => setRetryAttempt((prev) => prev + 1), retryInterval);
      } else {
        console.warn(
          `[WebSocket][${socket.name}] max retries reached, giving up`
        );
      }
    };

    socket.onerror = (event) => {
      console.error(`[WebSocket][${socket.name}] error:`, event);
      setIsConnected(false);
      socket.close();
    };

    return () => {
      if (socketRef.current) {
        console.log(
          `[WebSocket][${socketRef.current.name}] cleaning up connection`
        );
        if (socketRef.current.readyState === WebSocket.OPEN) {
          console.log(
            `[WebSocket][${socketRef.current.name}] closing connection`
          );
          socketRef.current.close();
        }
        socketRef.current = null;
      }
    };
  }, [auth, url, handleMessage, retryAttempt, retryAttempts, retryInterval]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);

  const send = useCallback(
    (_data: Message) => {
      if (!socketRef.current || !auth.user?.jwt || !auth.user.webSocketToken) {
        return false;
      }

      const message = {
        type: 'message' as const,
        message: _data,
        timestamp: Date.now(),
      };

      console.log(
        `[WebSocket] sending message to ${socketRef.current.name}`,
        message
      );

      try {
        socketRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('[WebSocket] error sending message:', error);
        return false;
      }
    },
    [auth.user?.jwt, auth.user?.webSocketToken]
  );

  return { send, data, isConnected };
}

export default useWebSocket;
