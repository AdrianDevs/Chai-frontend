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

  const handleMessage = useCallback(
    (event: MessageEvent<string>) => {
      console.log('[WebSocket] message received:', event.data);
      const message = parseWebSocketMessage(event.data);
      console.log('[WebSocket] parsed message:', message);

      switch (message.type) {
        case 'message':
          if (
            message.content &&
            typeof message.content === 'object' &&
            'userId' in message.content
          ) {
            const chatMessage = message.content as Message;
            if (chatMessage.userId === auth.user?.id) {
              console.log('[WebSocket] message is from self, ignoring');
              return;
            }
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
          console.warn(
            '[WebSocket] unknown message received:',
            message.content
          );
          break;
      }
    },
    [auth.user?.id]
  );

  const connect = useCallback(() => {
    // Don't create a new connection if we already have one
    console.log('[WebSocket] === connect ===');
    console.log(
      '[WebSocket] socketRef.current?.readyState:',
      socketRef.current?.readyState
    );

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
      console.group(`[WebSocket][${socket.name}] connection opened`);
      console.log(`[WebSocket][${socket.name}] readyState`, socket.readyState);
      console.log(
        `[WebSocket][${socket.name}] socketRef.current.name`,
        socketRef.current?.name
      );
      console.log(
        `[WebSocket][${socket.name}] socketRef.current.readyState`,
        socketRef.current?.readyState
      );
      console.groupEnd();

      // If socket and socketRef.current are not the same, and socket is open,
      // and socketRef.current is either open or connecting,
      // then we need to close the open socket
      if (
        socketRef.current &&
        socket !== socketRef.current &&
        socket.readyState === WebSocket.OPEN &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        console.log(
          `[WebSocket][${socket.name}] closing webSocket ${socket.name}`
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
      console.log(
        `[WebSocket][${socket.name}] socketRef.current`,
        socketRef.current?.name
      );
      // If the socketRef.current is not the same as the socket, then we need to skip the cleanup
      if (socketRef.current !== socket) {
        console.log(
          `[WebSocket][${socket.name}] socketRef.current is not the same as the socket, skipping`
        );
        return;
      }

      socketRef.current = null;
      setIsConnected(false);

      if (event.code === 1006) {
        console.log(
          `[WebSocket][${socket.name}] connection closed with code 1006, checking tokens`,
          auth.user
        );
        const currentEpoch = Date.now();

        const isTokenExpired =
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          (auth.user?.expiryEpoch && currentEpoch > auth.user.expiryEpoch) ||
          (auth.user?.webSocketTokenExpiryEpoch &&
            currentEpoch > auth.user.webSocketTokenExpiryEpoch);

        const foo =
          auth.user?.expiryEpoch && currentEpoch > auth.user.expiryEpoch;
        const bar =
          auth.user?.webSocketTokenExpiryEpoch &&
          currentEpoch > auth.user.webSocketTokenExpiryEpoch;

        console.log('[WebSocket] foo', foo);
        console.log('[WebSocket] bar', bar);

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
    console.log('[WebSocket] === useEffect ===');
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
