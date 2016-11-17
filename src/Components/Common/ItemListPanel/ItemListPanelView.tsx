import * as React from 'react';
import * as classNames from 'classnames';

import { BaseView } from '../../React/BaseView';
import { DataGridView, DataGridViewProps, DataGridColumn, DataGridTableViewTemplate } from '../DataGrid/DataGridView';
import { CommonPanel, CommonPanelProps } from '../CommonPanel/CommonPanel';
import { ItemListPanelViewModel } from './ItemListPanelViewModel';

import './ItemListPanel.less';

export * from './CountFooterContent';
export * from './ViewAllFooterAction';

export interface ItemListPanelProps extends CommonPanelProps, DataGridViewProps {
  children?: DataGridColumn[];
}

export class ItemListPanelView extends BaseView<ItemListPanelProps, ItemListPanelViewModel<any>> {
  public static displayName = 'ItemListPanelView';

  static defaultProps = {
    fill: true,
    search: false,
    pager: false,
    highlightSelected: false,
  };

  render() {
    const { className, children, rest, props } = this.restProps(x => {
      const { fill, view, search, pager, pagerLimits, highlightSelected } = x;
      return { fill, view, search, pager, pagerLimits, highlightSelected };
    });

    const viewType = props.view instanceof DataGridTableViewTemplate ? 'Table' : 'List';

    return (
      <CommonPanel { ...rest } className={ classNames('ItemListPanel', viewType, className) }>
        <DataGridView.Search { ...props } viewModel={ this.state.grid } />
        <DataGridView { ...props } viewModel={ this.state.grid } search={ false } pager={ false }>
          { children }
        </DataGridView>
        <DataGridView.Pager { ...props } viewModel={ this.state.grid } />
      </CommonPanel>
    );
  }
}
