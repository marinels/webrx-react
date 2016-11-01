import { Observable } from 'rx';
import * as wx from 'webrx';
// import * as moment from 'moment';

import { BaseViewModel } from '../../React/BaseViewModel';

export interface ViewportDimensions {
  width: number;
  height: number;
}

export class PageFooterViewModel extends BaseViewModel {
  public static displayName = 'PageFooterViewModel';

  public viewportDimensions: wx.IObservableReadOnlyProperty<ViewportDimensions>;

  public viewportDimensionsChanged: wx.ICommand<ViewportDimensions>;

  constructor() {
    super();

    this.viewportDimensionsChanged = wx.asyncCommand((x: ViewportDimensions) => Observable.of(x));

    this.viewportDimensions = wx
      .whenAny(this.viewportDimensionsChanged.results, x => x)
      .filter(x => x != null)
      .debounce(100)
      // .map(x => `${ x.width || 0 }x${ x.height || 0 }`)
      .toProperty();

    // this.copyright = copyright ? copyright : moment().format('YYYY');
  }
}

export default PageFooterViewModel;
