'use strict';

import BaseViewModel from '../React/BaseViewModel';

export class AppViewModel extends BaseViewModel {
  public EnablePropertyChangedDebugging = false;
  public EnableViewRenderDebugging = false;
  public EnableRouteDebugging = false;
  public EnableStoreApiDebugging = false;

  constructor() {
    super();
  }
}

export default AppViewModel;
