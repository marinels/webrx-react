import * as React from 'react';

import { PanelProps, Panel } from './Panel';

export interface WrapPanelProps extends PanelProps {
}

export class WrapPanel extends Panel<WrapPanelProps> {
  public static displayName = 'WrapPanel';

  render() {
    return this.renderPanel('WrapPanel');
  }
}
