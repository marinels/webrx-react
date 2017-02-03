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
  };

  updateOn() {
    return [
      this.state.isLoading.changed,
    ];
  }

  render() {
    const { className, children, rest, props } = this.restProps(x => {
      const { fill, viewTemplate, search, pager, loadingContent, selectable, highlightSelected, checkmarkSelected } = x;
      return { fill, viewTemplate, search, pager, loadingContent, selectable, highlightSelected, checkmarkSelected };
    });

    const viewType = props.viewTemplate instanceof DataGridTableViewTemplate ? 'Table' : 'List';

    return (
      <CommonPanel { ...rest } className={ classNames('ItemListPanel', viewType, className) }>
        {
          this.renderConditional(
            props.search != null && props.search !== false && this.state.isLoading() === false,
            () => this.renderConditional(
              React.isValidElement(props.search),
              () => props.search,
              () => <DataGridView.Search { ...(props.search === true ? {} : props.search) } grid={ this.state.grid } viewTemplate={ props.viewTemplate } fill />,
            ),
          )
        }
        <DataGridView { ...props } viewModel={ this.state.grid } search={ false } pager={ false } fill>
          { children }
        </DataGridView>
        {
          this.renderConditional(
            props.pager != null && props.pager !== false && this.state.isLoading() === false,
            () => this.renderConditional(
              React.isValidElement(props.pager),
              () => props.pager,
              () => <DataGridView.Pager { ...(props.pager === true ? {} : props.pager) } grid={ this.state.grid } viewTemplate={ props.viewTemplate } fill />,
            ),
          )
        }
      </CommonPanel>
    );
  }
}
