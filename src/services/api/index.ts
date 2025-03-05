import ApiMethods from './apiMethods';
import type { Conversation, Info } from './types';

const ENDPOINTS = {
  INFO: () => '/info',
  SIGNUP: () => '/auth/signup',
  LOGIN: () => '/auth/login',
  VALIDATE_USERNAME: (username: string) =>
    `/users/validate/?username=${username}`,
  USERS_BY_USERNAMES: (usernames: Array<string>) =>
    `/users?usernames=${usernames.join(',')}`,
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

  static fetchConversations = () => {
    const url = '/conversations';
    return ApiMethods.get<Array<Conversation>>(url);
  };

  // static loadSurveys = () => {
  //   const url = ENDPOINTS.SURVEYS();
  //   return ApiMethods.get<Survey[]>(url);
  // };

  // static loadSurvey = (surveyId: number) => {
  //   const url = ENDPOINTS.SURVEYS() + surveyId;
  //   return ApiMethods.get<Survey>(url);
  // };

  // static createSurvey = (
  //   survey: Omit<Survey, 'id' | 'brand'> & { brand_id: number }
  // ) => {
  //   const url = ENDPOINTS.SURVEYS();
  //   return ApiMethods.post(url, survey);
  // };

  // static updateSurvey = (
  //   surveyId: number,
  //   survey: Omit<Survey, 'id' | 'brand'> & { brand_id: number }
  // ) => {
  //   const url = ENDPOINTS.SURVEYS() + surveyId + '/';
  //   return ApiMethods.put(url, survey);
  // };

  // static deleteSurvey = (surveyId: number) => {
  //   const url = ENDPOINTS.SURVEYS() + surveyId + '/';
  //   return ApiMethods.delete(url);
  // };
}

export default API;
