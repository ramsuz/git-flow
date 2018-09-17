import { inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import ErrorUtils from '../utils/errorUtils';

import {LogManager} from 'aurelia-framework';
let logger = LogManager.getLogger('OAuthLauncher');

@inject(HttpClient)
export default class OAuthLauncher {
  constructor(httpClient) {
    const baseUrl = "http://localhost:8333/api/";

    httpClient.configure(config => {
      config
        .withBaseUrl(baseUrl);
        //.withInterceptor(this.authService.tokenInterceptor);
    });
    this.httpClient = httpClient;
  }

  /**
   * Model data 
   * {'success': true/false, 'errorCode': ''}
   */
  async init() {
    logger.debug('init oauth-launcher');
    var data = await this.callWsRest();
    if (!data.success && data.status === 403) {
      data = await this.getOAuthCode();
      if (data.code) {
        data = await this.getOAuthToken();
        if(data.success)
          return {'isAuthenticated': true};
      } 
    }

    ErrorUtils.handleOAuthErrors(data);

    return {'isAuthenticated': false};
  }

  callWsRest() {
    return this.httpClient.fetch('users')
    .then(response => {
      if(response.status === 403)
        return {success: false, status: 403, errorCode: 'NO_TOKEN_PROVIDED'};
      else 
        return response.json();
    })
    .catch(error => {
      return {success: false, errorCode: 'RESOURCE_SERVER_UNAVAILABLE', errorStack: error};
    });
  }

  getOAuthCode() {
    let oAuthCode = new Promise(function(resolve, reject) {
      setTimeout(function() { 
        resolve({'code':'XSDTFFZ'});
      }, 50);
    });
    return oAuthCode; 
  }

  getOAuthToken() {
    let userName = 'Gandalf'; 
    let password = 'password3';

    return this.httpClient.fetch('token', {
      method: 'post',
      body: json({ name: userName, password: password })
    })
      .then(response => response.json())
      .then(tokenResult => {
        if (tokenResult.success) window.localStorage.setItem("token", tokenResult.token);
        return tokenResult;
      })
      .catch(error => {
        return {success: false, errorCode: 'OAUTH_SERVER_UNAVAILABLE', errorStack: error};
      });
  }

  promiseInit() {
    let root = new Promise(function(resolve, reject) {
      setTimeout(function() { 
        resolve('app');
      }, 50);
    });
    return root;
  }
}


aurelia.start().then(() => {
    /** Loading of Properties */
    
    /** Init Of Authentication via SSO */
    let oAuthLauncher = aurelia.container.get(OAuthLauncher);
    oAuthLauncher.init().then(data => {
      let root = data.isAuthenticated ? PLATFORM.moduleName('app') : PLATFORM.moduleName('login');
      aurelia.setRoot(root);
    });
  });
