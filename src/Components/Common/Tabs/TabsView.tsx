import * as React from 'react';
import { Tabs, Tab, TabProps } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { TabsViewModel } from './TabsViewModel';

import './Tabs.less';

export interface TabsProps extends BaseViewProps {
  id: string;
  selectedIndex?: number;
  dataTemplate?: (x: any, i: number, isVisible: boolean) => React.HTMLProps<TabProps>;
  children?: any;
}

export class TabsView extends BaseView<TabsProps, TabsViewModel<any>> {
  public static displayName = 'TabsView';

  constructor(props?: TabsProps, context?: any) {
    super(props, context);

    if (this.props.selectedIndex != null && this.state.selectedIndex() == null) {
      this.state.selectIndex.execute(this.props.selectedIndex);
    }
  }

  private getTab(content: React.ReactElement<TabProps>, i: number, isVisible: boolean) {
    let tab: any;

    if (content != null) {
      const props: any = {
        key: content.key || i,
        eventKey: content.props.eventKey || i,
        title: content.props.title || `Tab ${i}`,
        // there is a bug in react-bootstrap where the active tab is not properly
        // set after removing or switching tabs. this className override along with
        // disabling animation on the Tabs component corrects this issue.
        // see: https://github.com/react-bootstrap/react-bootstrap/issues/1892
        className: { active: isVisible },
      };

      if (content.type === Tab) {
        tab = React.cloneElement(content, props, isVisible ? content.props.children : null);
      }
      else {
        tab = (
          <Tab {...props}>
            { isVisible ? content : null }
          </Tab>
        );
      }
    }

    return tab;
  }

  private getTabs() {
    const tabs: any[] = [];
    const selectedIndex = this.state.selectedIndex();

    if (this.props.dataTemplate == null) {
      // static tabs
      React.Children.map(this.props.children, (x: React.ReactElement<TabProps>, i: number) => {
        const isVisible = selectedIndex === i;
        const tab = this.getTab(x, i, isVisible);

        if (tab != null) {
          tabs.push(tab);
        }
      });
    }
    else {
      // dynamic tabs
      this.state.items.forEach((x, i) => {
        const isVisible = selectedIndex === i;
        const tabContent = this.props.dataTemplate.apply(this, [ x, i, isVisible ]) as React.ReactElement<TabProps>;
        const tab = this.getTab(tabContent, i, isVisible);

        if (tab != null) {
          tabs.push(tab);
        }
      });
    }

    return tabs;
  }

  updateOn() {
    return [
      this.state.items.listChanged,
      this.state.selectedIndex.changed,
    ];
  }

  render() {
    const selectedIndex = this.state.selectedIndex();
    const tabs = this.getTabs();

    return (
      <div className='Tabs'>
        <Tabs animation={false} id={this.props.id} activeKey={selectedIndex} onSelect={this.bindEventToCommand(x => x.selectIndex)}>
          { tabs }
        </Tabs>
      </div>
    );
  }
}
