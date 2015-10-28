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
  updateOn() {
    return [
      this.state.items.listChanged,
      this.state.selectedIndex.changed
    ]
  }

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

  render() {
    return (
      <div className='Tabs'>
        <Tabs activeKey={this.state.selectedIndex()} onSelect={this.bindCallback(x => x.selectedIndex, x => x[0])}>
          {this.getTabs()}
        </Tabs>
      </div>
    );
  }
}

export default TabsView;
