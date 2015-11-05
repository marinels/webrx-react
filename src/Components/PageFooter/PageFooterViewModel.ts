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

  public copyright: string;

  constructor(copyright?: string) {
    super();

    this.copyright = copyright ? copyright : moment().format('YYYY');
  }

  public viewportDimensionsChanged = wx.asyncCommand((x: IViewportDimension) => Rx.Observable.return(x));
  public viewportDimensions = this.viewportDimensionsChanged.results
    .debounce(100)
    .where(x => x != null && x.width != null && x.height != null)
    .select(x => String.format('{0}x{1}', x.width, x.height))
    .toProperty();
}

export default PageFooterViewModel;
