import ApiMethods from './apiMethods';
import type {
  Conversation,
  ConversationUser,
  Info,
  Message,
  User,
} from './types';

const ENDPOINTS = {
  INFO: () => '/info',
  SIGNUP: () => '/auth/signup',
  LOGIN: () => '/auth/login',
  VALIDATE_USERNAME: (username: string) =>
    `/users/validate/?username=${username}`,
  USERS_BY_USERNAMES: (usernames: Array<string>) => {
    if (usernames.length === 0) {
      return '/users/search';
    }

    const startUrl = `/users/search?usernames=${usernames[0]}`;

    if (usernames.length === 1) {
      return startUrl;
    }

    const url = usernames.slice(1).reduce((acc, username) => {
      return `${acc}&usernames=${username}`;
    }, startUrl);
    return url;
  },
  CREATE_CONVERSATION: () => '/conversations',
  DELETE_CONVERSATION: (conversationId: number) =>
    `/conversations/${conversationId}`,
  CONVERSATION_BY_ID: (conversationId: number) =>
    `/conversations/${conversationId}`,
  CONVERSATION_MESSAGES: (
    conversationId: number,
    page: number,
    limit: number
  ) =>
    `/conversations/${conversationId}/messages?offset=${page}&limit=${limit}`,
  CREATE_CONVERSATION_MESSAGE: (conversationId: number) =>
    `/conversations/${conversationId}/messages`,
  CONVERSATION_USERS: (conversationId: number) =>
    `/conversations/${conversationId}/users`,
  DELETE_CONVERSATION_USER: (conversationId: number, userId: number) =>
    `/conversations/${conversationId}/users/${userId}`,
  ADD_CONVERSATION_USER: (conversationId: number) =>
    `/conversations/${conversationId}/users/`,
  DELETE_PROFILE: () => '/users/me',
};

class API {
  static fetchInfo = () => {
    const url = ENDPOINTS.INFO();
    return ApiMethods.get<Info>(url);
  };

  static signUp = (username: string, password: string) => {
    const url = ENDPOINTS.SIGNUP();
    return ApiMethods.post<{
      id: number;
      username: string;
      token: string;
      expiresIn: string;
    }>(url, { username, password });
  };

  static login = (username: string, password: string) => {
    const url = ENDPOINTS.LOGIN();
    return ApiMethods.post<{
      id: number;
      username: string;
      token: string;
      expiresIn: string;
    }>(url, { username, password });
  };

  static validateUsername = (username: string) => {
    const url = ENDPOINTS.VALIDATE_USERNAME(username);
    return ApiMethods.get<{ status: 'available' | 'taken' }>(url);
  };

  static fetchUsersByUsernames = (usernames: Array<string>) => {
    const url = ENDPOINTS.USERS_BY_USERNAMES(usernames);
    return ApiMethods.get<Array<{ id: number; username: string }>>(url);
  };

  static createConversation = (
    conversationName: string,
    invitees: Array<{ id: number; username: string }>
  ) => {
    const url = ENDPOINTS.CREATE_CONVERSATION();
    return ApiMethods.post<Conversation>(url, {
      conversation: { name: conversationName },
      user_ids: invitees.map((invitee) => invitee.id),
    });
  };

  static deleteConversation = (conversationId: number) => {
    const url = ENDPOINTS.DELETE_CONVERSATION(conversationId);
    return ApiMethods.delete(url);
  };

  static fetchConversations = () => {
    const url = '/conversations';
    return ApiMethods.get<Array<Conversation>>(url);
  };

  static fetchConversationById = (conversationId: number) => {
    const url = ENDPOINTS.CONVERSATION_BY_ID(conversationId);
    return ApiMethods.get<Conversation>(url);
  };

  static fetchConversationMessages = (
    conversationId: number,
    page: number,
    limit: number
  ) => {
    const url = ENDPOINTS.CONVERSATION_MESSAGES(conversationId, page, limit);
    return ApiMethods.get<Array<Message>>(url);
  };

  static createConversationMessage = (
    conversationId: number,
    message: Omit<Message, 'id' | 'createdAt'>
  ) => {
    const url = ENDPOINTS.CREATE_CONVERSATION_MESSAGE(conversationId);
    return ApiMethods.post<Omit<Message, 'id' | 'createdAt'>>(url, message);
  };

  static fetchConversationUsers = (conversationId: number) => {
    console.log('fetchConversationUsers', conversationId);
    const url = ENDPOINTS.CONVERSATION_USERS(conversationId);
    return ApiMethods.get<Array<User>>(url);
  };

  static deleteConversationUser = (conversationId: number, userId: number) => {
    const url = ENDPOINTS.DELETE_CONVERSATION_USER(conversationId, userId);
    return ApiMethods.delete(url);
  };

  static addConversationUser = (conversationId: number, userId: number) => {
    const url = ENDPOINTS.ADD_CONVERSATION_USER(conversationId);
    return ApiMethods.post<ConversationUser>(url, { user_id: userId });
  };

  static deleteProfile = () => {
    const url = ENDPOINTS.DELETE_PROFILE();
    return ApiMethods.delete(url);
  };
}

export default API;
