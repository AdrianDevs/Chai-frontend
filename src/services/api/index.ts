import ApiMethods from './endpoints';
import type { Info } from './types';

const ENDPOINTS = {
  INFO: () => '/info',
  SIGNUP: () => '/auth/signup',
  LOGIN: () => '/auth/login',
};

class API {
  private static accessToken: string | null = null;

  static setAccessToken = (token: string) => {
    API.accessToken = token;
  };

  static getAccessToken = () => {
    return API.accessToken;
  };

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
