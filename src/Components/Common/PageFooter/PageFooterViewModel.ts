import { Observable } from 'rx';
import * as wx from 'webrx';
import * as moment from 'moment';

import { BaseViewModel } from '../../React/BaseViewModel';

export interface ViewportDimensions {
  width: number;
  height: number;
}

export class PageFooterViewModel extends BaseViewModel {
  public static displayName = 'PageFooterViewModel';

  public copyright: string;

  public viewportDimensionsChanged = wx.asyncCommand((x: ViewportDimensions) => Observable.of(x));
  public viewportDimensions = this.viewportDimensionsChanged.results
    .debounce(100)
    .filter(x => x != null && x.width != null && x.height != null)
    .map(x => `${x.width}x${x.height}`)
    .toProperty();

  constructor(copyright?: string) {
    super();

    this.copyright = copyright ? copyright : moment().format('YYYY');
  }
}

export default PageFooterViewModel;
