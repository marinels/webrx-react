import * as React from 'react';
import { Observable } from 'rx';
import { Tabs, Tab } from 'react-bootstrap';
import * as classNames from 'classnames';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { TabsViewModel } from './TabsViewModel';
import { wxr } from '../../React';

import './Tabs.less';

export type ReadonlyTabsViewModel<TData> = Readonly<TabsViewModel<TData>>;

export class TabRenderTemplate<TData> {
  public static displayName = 'TabViewTemplate';

  protected readonly renderTemplateContainer: (content: () => any, item: TData, index: number, viewModel: ReadonlyTabsViewModel<TData>, view: TabsView) => any;

  constructor(
    protected readonly titleSelector: (item: TData, index: number, viewModel: ReadonlyTabsViewModel<TData>, view: TabsView) => string,
    protected readonly renderItem: (item: TData, index: number, viewModel: ReadonlyTabsViewModel<TData>, view: TabsView) => any = x => x.toString(),
    protected readonly keySelector: (item: TData, index: number, viewModel: ReadonlyTabsViewModel<TData>, view: TabsView) => any = (x, i) => i,
    renderTemplateContainer?: (content: () => any, item: TData, index: number, viewModel: ReadonlyTabsViewModel<TData>, view: TabsView) => any,
  ) {
    this.renderTemplateContainer = renderTemplateContainer || this.renderDefaultTemplateContainer;
  }

  protected renderDefaultTemplateContainer(content: () => any, item: TData, index: number, viewModel: ReadonlyTabsViewModel<TData>, view: TabsView) {
    return (
      <Tab key={ this.keySelector(item, index, viewModel, view) } title={ this.titleSelector(item, index, viewModel, view) } eventKey={ index }>
        { wxr.renderConditional(index === viewModel.selectedIndex.value, content) }
      </Tab>
    );
  }

  public render(viewModel: ReadonlyTabsViewModel<TData>, view: TabsView) {
    return viewModel.tabs.value
      .map((x, i) => {
        return this.renderTemplateContainer(() => this.renderItem(x, i, viewModel, view), x, i, viewModel, view);
      });
  }
}

// NOTE: id is required for tab (belongs to HTMLAttributes)
export interface TabsProps extends BaseViewProps {
  template?: TabRenderTemplate<any>;
}

export class TabsView extends BaseView<TabsProps, TabsViewModel<any>> {
  public static displayName = 'TabsView';

  updateOn() {
    return [
      this.state.tabs.changed,
      this.state.selectedIndex.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { template, children } = x;
      return { template, children };
    });

    return (
      <div { ...rest } className={ classNames('Tabs', className) }>
        { this.renderTabs() }
      </div>
    );
  }

  private renderTabs() {
    return this.renderNullable(
      this.props.template,
      x => this.renderDynamicTabs(x),
      () => this.renderStaticTabs(),
    );
  }

  private renderStaticTabs() {
    return (
      <Tabs id={ this.props.id } unmountOnExit activeKey={ this.state.selectedIndex.value }
        onSelect={ this.bindEventToCommand(x => x.selectIndex) }
      >
        {
          React.Children
            .map(this.props.children, (x: any, i: number) => {
              return React.cloneElement(x, { eventKey: i });
            })
        }
      </Tabs>
    );
  }

  private renderDynamicTabs(template: TabRenderTemplate<any>) {
    return (
      <Tabs id={ this.props.id } activeKey={ this.state.selectedIndex.value }
        onSelect={ this.bindEventToCommand(x => x.selectIndex) }
      >
        { template.render(this.state, this) }
      </Tabs>
    );
  }
}
