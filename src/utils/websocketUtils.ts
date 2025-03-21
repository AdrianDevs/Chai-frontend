import type { Message } from '../services/api/types';

export type WebSocketMessageType =
  | 'authenticate'
  | 'message'
  | 'info'
  | 'error'
  | 'unknown';

export type BaseWebSocketMessage = {
  type: WebSocketMessageType;
  content: object | string;
  isValid: boolean;
};

export type AuthenticateMessage = BaseWebSocketMessage & {
  type: 'authenticate';
  // message: string;
};

export type ChatMessage = BaseWebSocketMessage & {
  type: 'message';
  // message: Message;
};

export type InfoMessage = BaseWebSocketMessage & {
  type: 'info';
  // message: string;
};

export type ErrorMessage = BaseWebSocketMessage & {
  type: 'error';
  message: string;
  error?: string;
};

export type UnknownMessage = BaseWebSocketMessage & {
  type: 'unknown';
  message: string;
};

export type WebSocketMessage =
  | AuthenticateMessage
  | ChatMessage
  | InfoMessage
  | ErrorMessage
  | UnknownMessage;

export function parseWebSocketMessage(data: string): WebSocketMessage {
  try {
    const parsed = JSON.parse(data) as WebSocketMessage | string | null;
    if (isValidWebSocketMessage(parsed)) {
      return parsed;
    }
    console.error('[WebSocket] invalid message:', data);
    return createUnknownMessage(data, 'Invalid message');
  } catch (error) {
    console.error('[WebSocket] error parsing message:', error);
    return createUnknownMessage(data, 'Error parsing message');
  }
}

function isValidWebSocketMessage(data: unknown): data is WebSocketMessage {
  if (!data || typeof data !== 'object') return false;

  const msg = data as Partial<WebSocketMessage>;
  if (!msg.type || !msg.content || !msg.isValid) return false;

  switch (msg.type) {
    case 'authenticate':
    case 'info':
    case 'error':
      return typeof msg.content === 'string';
    case 'message':
      return isValidChatMessage(msg.content);
    default:
      return false;
  }
}

function isValidChatMessage(message: unknown): message is Message {
  if (!message || typeof message !== 'object') return false;

  const msg = message as Partial<Message>;
  return (
    typeof msg.id === 'number' &&
    typeof msg.content === 'string' &&
    typeof msg.userId === 'number' &&
    typeof msg.conversationId === 'number' &&
    typeof msg.createdAt === 'string'
    // msg.createdAt instanceof Date
  );
}

function createUnknownMessage(
  content: string,
  message?: string
): UnknownMessage {
  return {
    type: 'unknown',
    content: content,
    isValid: false,
    message: message ?? content,
  };
}
