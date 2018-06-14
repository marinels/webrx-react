// tslint:disable:max-classes-per-file

import * as React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React';
import { TabsViewModel } from './TabsViewModel';

export class TabRenderTemplate<T> {
  public static displayName = 'TabViewTemplate';

  protected readonly renderTemplateContainer: (
    content: () => any,
    item: T,
    index: number,
    viewModel: Readonly<TabsViewModel<T>>,
    view: TabsView,
  ) => any;

  constructor(
    protected readonly titleSelector:
      (item: T, index: number, viewModel: Readonly<TabsViewModel<T>>, view: TabsView) => string,
    protected readonly renderItem:
      (item: T, index: number, viewModel: Readonly<TabsViewModel<T>>, view: TabsView) => any = x => x.toString(),
    protected readonly keySelector:
      (item: T, index: number, viewModel: Readonly<TabsViewModel<T>>, view: TabsView) => any = (x, i) => i,
    renderTemplateContainer?:
      (content: () => any, item: T, index: number, viewModel: Readonly<TabsViewModel<T>>, view: TabsView) => any,
  ) {
    this.renderTemplateContainer = renderTemplateContainer || this.renderDefaultTemplateContainer;
  }

  protected renderDefaultTemplateContainer(
    content: () => any,
    item: T,
    index: number,
    viewModel: Readonly<TabsViewModel<T>>,
    view: TabsView,
  ) {
    return (
      <Tab key={ this.keySelector(item, index, viewModel, view) }
        title={ this.titleSelector(item, index, viewModel, view) }
        eventKey={ index }
      >
        { TabsView.wxr.renderConditional(index === viewModel.selectedIndex.value, content) }
      </Tab>
    );
  }

  public render(viewModel: Readonly<TabsViewModel<T>>, view: TabsView) {
    return viewModel.tabs.value
      .map((x, i) => {
        return this.renderTemplateContainer(() => this.renderItem(x, i, viewModel, view), x, i, viewModel, view);
      });
  }
}

export interface TabsProps<T = {}> {
  template?: TabRenderTemplate<T>;
}

export interface TabsViewProps extends BaseViewProps<TabsViewModel<{}>>, TabsProps {
}

export class TabsView extends BaseView<TabsViewProps, TabsViewModel<{}>> {
  public static displayName = 'TabsView';

  updateOn(viewModel: Readonly<TabsViewModel<{}>>) {
    return [
      viewModel.tabs.changed,
      viewModel.selectedIndex.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { template, children } = x;
      return { template, children };
    });

    return (
      <div { ...rest } className={ this.wxr.classNames('Tabs', className) }>
        { this.renderTabs() }
      </div>
    );
  }

  private renderTabs() {
    return this.wxr.renderNullable(
      this.props.template,
      x => this.renderDynamicTabs(x),
      () => this.renderStaticTabs(),
    );
  }

  private renderStaticTabs() {
    return (
      <Tabs id={ this.props.id } unmountOnExit activeKey={ this.viewModel.selectedIndex.value }
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
      <Tabs id={ this.props.id } activeKey={ this.viewModel.selectedIndex.value }
        onSelect={ this.bindEventToCommand(x => x.selectIndex) }
      >
        { template.render(this.viewModel, this) }
      </Tabs>
    );
  }
}
