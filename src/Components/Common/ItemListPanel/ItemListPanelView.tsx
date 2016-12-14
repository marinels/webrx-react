import * as React from 'react';
import * as classNames from 'classnames';

import { BaseView, ViewModelProps } from '../../React/BaseView';
import { DataGridView, DataGridProps, DataGridColumn, DataGridTableViewTemplate } from '../DataGrid/DataGridView';
import { CommonPanel, CommonPanelProps } from '../CommonPanel/CommonPanel';
import { ItemListPanelViewModel } from './ItemListPanelViewModel';

import './ItemListPanel.less';

export * from './CountFooterContent';
export * from './ViewAllFooterAction';

export interface ItemListPanelProps extends CommonPanelProps, DataGridProps, ViewModelProps {
  children?: DataGridColumn[];
}

export class ItemListPanelView extends BaseView<ItemListPanelProps, ItemListPanelViewModel<any>> {
  public static displayName = 'ItemListPanelView';

  static defaultProps = {
    fill: true,
  };

  updateOn() {
    return [
      this.state.isLoading.changed,
    ];
  }

  render() {
    const { className, children, rest, props } = this.restProps(x => {
      const { fill, view, search, pager, pagerLimits, loadingContent, selectable, highlightSelected, checkmarkSelected } = x;
      return { fill, view, search, pager, pagerLimits, loadingContent, selectable, highlightSelected, checkmarkSelected };
    });

    const viewType = props.view instanceof DataGridTableViewTemplate ? 'Table' : 'List';

    return (
      <CommonPanel { ...rest } className={ classNames('ItemListPanel', viewType, className) }>
        {
          this.renderConditional(props.search === true && this.state.isLoading() === false, () => (
            <DataGridView.Search grid={ this.state.grid } view={ props.view } fill />
          ), () => props.search)
        }
        <DataGridView { ...props } viewModel={ this.state.grid } search={ false } pager={ false }>
          { children }
        </DataGridView>
        {
          this.renderConditional(props.pager === true && this.state.isLoading() === false, () => (
            <DataGridView.Pager grid={ this.state.grid } view={ props.view } limits={ props.pagerLimits } fill />
          ), () => props.pager)
        }
      </CommonPanel>
    );
  }
}
