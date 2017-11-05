import { Observable } from 'rxjs';

import { ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';

export interface ViewportDimensions {
  width: number;
  height: number;
}

export class PageFooterViewModel extends BaseViewModel {
  public static displayName = 'PageFooterViewModel';

  public readonly viewportDimensions: ReadOnlyProperty<ViewportDimensions>;

  public readonly viewportDimensionsChanged: Command<ViewportDimensions>;

  constructor() {
    super();

    this.viewportDimensionsChanged = this.wx.command<ViewportDimensions>();

    this.viewportDimensions = this.wx
      .whenAny(this.viewportDimensionsChanged.results, x => x)
      .filterNull()
      .debounceTime(100)
      .toProperty();
  }
}

export default PageFooterViewModel;
