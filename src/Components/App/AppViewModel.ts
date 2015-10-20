'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export interface IAppConfig {
  EnablePropertyChangedDebugging: boolean;
  EnableViewRenderDebugging: boolean;
  EnableRouteDebugging: boolean;
  EnableStoreApiDebugging: boolean;
}

export class AppViewModel extends BaseViewModel {
  constructor(config = <IAppConfig>{}) {
    super();

    this.config = config;
  }

  public config: IAppConfig;
  public alerts = wx.list<any>();
  public status = wx.property('');
}

export default AppViewModel;
