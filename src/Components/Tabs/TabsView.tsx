'use strict';

import * as React from 'react';

import { Tabs, Tab } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import { TabsViewModel } from './TabsViewModel';

export interface ITab {
  header: string;
  disabled?: boolean;
  children?: any;
}

interface ITabsProps extends IBaseViewProps {
  dataTemplate?: (x: any, i: number) => ITab;
  children?: any;
}

export class TabsView extends BaseView<ITabsProps, TabsViewModel> {
  public static displayName = 'TabsView';

  private getTabs() {
    return this.props.dataTemplate == null ?
      this.props.children :
      this.state.items.map((x, i) => {
        let tab = this.props.dataTemplate(x, i);
        let selectedIndex = this.state.selectedIndex();

        return (
          <Tab key={i} eventKey={i} title={tab.header}>
            {selectedIndex == i ? tab.children : null}
          </Tab>
        );
      });
  }

  updateOn() {
    return [
      this.state.items.listChanged,
      this.state.selectedIndex.changed
    ]
  }

  render() {
    return (
      <div className='Tabs'>
        <Tabs activeKey={this.state.selectedIndex()} onSelect={this.bindEvent(x => x.selectIndex, (x: number) => x)}>
          {this.getTabs()}
        </Tabs>
      </div>
    );
  }
}

export default TabsView;
