import * as React from 'react';

import { wxr } from '../../React';
import { PanelProps, Panel } from './Panel';

export enum StackPanelOrientation {
  Horizontal,
  Vertical,
}

export interface StackPanelProps extends PanelProps {
  orientation?: StackPanelOrientation | 'Horizontal' | 'Vertical';
}

export class StackPanel extends Panel<StackPanelProps> {
  public static displayName = 'StackPanel';

  public static defaultOrientiation = StackPanelOrientation.Vertical;

  static defaultProps = {
    orientation: StackPanel.defaultOrientiation,
  };

  render() {
    const { orientation, ...rest } = this.props;

    const orientationName = String.isString(orientation) ?
      orientation :
      StackPanelOrientation[orientation || StackPanel.defaultOrientiation] as string;

    return this.renderPanel(wxr.classNames('StackPanel', `StackPanel-${ orientationName }`), rest);
  }
}
