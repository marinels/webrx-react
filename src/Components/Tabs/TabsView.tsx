'use strict';

import * as React from 'react';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import { TabsViewModel } from './TabsViewModel';

interface ITabsProps extends IBaseViewProps {
}

export class TabsView extends BaseView<ITabsProps, TabsViewModel> {
  render() {
    return (
      <div className='Tabs'>
      </div>
    );
  }
}

export default TabsView;
