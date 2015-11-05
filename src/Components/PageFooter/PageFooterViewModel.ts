'use strict';

import * as wx from 'webrx';
import * as moment from 'moment';

import BaseViewModel from '../React/BaseViewModel';

export interface IViewportDimension {
  width: number;
  height: number;
}

export class PageFooterViewModel extends BaseViewModel {
  public static displayName = 'PageFooterViewModel';

  constructor(copyright?: string) {
    super();

    this.copyright = copyright ? copyright : moment().format('YYYY');
  }

  public testCommand = wx.command(x => console.log(x));
  public viewportDimensionsChanged = wx.asyncCommand<IViewportDimension>(x => Rx.Observable.return(x));
  public viewportDimensions = this.viewportDimensionsChanged
    .results
    .select(x => (x && x.width && x.height) ? String.format('{0}x{1}', x.width, x.height) : '')
    .toProperty();

  public copyright: string;
}

export default PageFooterViewModel;
