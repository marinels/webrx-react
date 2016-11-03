import * as React from 'react';
import * as classNames from 'classnames';
import { SelectCallback } from 'react-bootstrap';

import { BaseView } from '../../React/BaseView';
import { DataGridView, DataGridProps, DataGridColumn } from '../DataGrid/DataGridView';
import { CommonPanel, CommonPanelProps } from '../CommonPanel/CommonPanel';
import { ItemListPanelViewModel } from './ItemListPanelViewModel';

import './ItemListPanel.less';

export * from './CountFooterContent';
export * from './ViewAllFooterAction';

export interface ItemListPanelProps extends DataGridProps, CommonPanelProps {
  children?: DataGridColumn[];

  // we need to explicitly define this as it overrides a default onSelect
  onSelect?: SelectCallback;
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

    return (
      <CommonPanel { ...rest } className={ classNames('ItemListPanel', className) }>
        <DataGridView { ...props } viewModel={ this.state.grid }>
          { children }
        </DataGridView>
      </CommonPanel>
    );
  }
}
