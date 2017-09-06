import * as React from 'react';

import { wxr } from '../../React';
import { PanelProps, Panel } from './Panel';

export enum StackPanelOrientation {
  Horizontal,
  Vertical,
}

export interface StackPanelProps extends PanelProps {
  /**
   * define which direction this stack panel expands
   * NOTE: you can use the StackPanelOrientation enum or just the string representation
   */
  orientation?: StackPanelOrientation | keyof typeof StackPanelOrientation;
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
