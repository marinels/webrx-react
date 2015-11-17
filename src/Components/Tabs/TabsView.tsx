'use strict';

import * as React from 'react';

import { Tabs, Tab, TabProps } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import { TabsViewModel } from './TabsViewModel';

import './Tabs.less';

export interface ITab {
  header: string;
  disabled?: boolean;
  children?: any;
}

interface ITabsProps extends IBaseViewProps {
  selectedIndex?: number;
  dataTemplate?: (x: any, i: number) => ITab;
  children?: any;
}

export class TabsView extends BaseView<ITabsProps, TabsViewModel> {
  public static displayName = 'TabsView';

  constructor(props?: ITabsProps, context?: any) {
    super(props, context);

    if (this.props.selectedIndex != null && this.state.selectedIndex() == null) {
      this.state.selectIndex.execute(this.props.selectedIndex);
    }
  }

  private getTabs() {
    let selectedIndex = this.state.selectedIndex();

    return this.props.dataTemplate == null ?
      React.Children.map(this.props.children, (x: React.ReactElement<TabProps>, i: number) => {
        return React.cloneElement(x, x.props, selectedIndex == i ? x.props.children : null);
      }) :
      this.state.items.map((x, i) => {
        let tab = this.props.dataTemplate(x, i);

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
        <Tabs activeKey={this.state.selectedIndex()} onSelect={this.bindEvent(x => x.selectIndex, null, (x: number) => x)}>
          {this.getTabs()}
        </Tabs>
      </div>
    );
  }
}

export default TabsView;
