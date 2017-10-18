import * as React from 'react';

import { PanelProps, Panel } from './Panel';

export interface WrapPanelProps extends PanelProps {
}

export interface WrapPanelComponentProps extends React.HTMLProps<WrapPanel>, WrapPanelProps {
}

export class WrapPanel extends Panel<WrapPanelComponentProps> {
  public static displayName = 'WrapPanel';

  render() {
    return this.renderPanel('WrapPanel');
  }
}
