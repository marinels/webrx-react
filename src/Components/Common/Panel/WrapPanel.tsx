import * as React from 'react';

import { Panel, PanelProps } from './Panel';

export interface WrapPanelComponentProps extends React.HTMLProps<any>, PanelProps {
}

export class WrapPanel extends Panel<WrapPanelComponentProps> {
  public static displayName = 'WrapPanel';

  render() {
    return this.renderPanel('WrapPanel');
  }
}
