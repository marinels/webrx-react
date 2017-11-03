import * as React from 'react';
import { Observable } from 'rxjs';

import { BaseView, ViewModelProps } from '../../React';
import { DataGridView, DataGridProps, DataGridColumn, DataGridListViewTemplate, DataGridViewType } from '../DataGrid/DataGridView';
import { CommonPanel, CommonPanelProps } from '../CommonPanel/CommonPanel';
import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';

export * from './CountFooterContent';
export * from './ViewAllFooterAction';

export interface ItemListPanelProps extends CommonPanelProps, DataGridProps, ViewModelProps<BaseItemListPanelViewModel<any, any, any, any>> {
}

export class ItemListPanelView extends BaseView<ItemListPanelProps, BaseItemListPanelViewModel<any, any, any, any>> {
  public static displayName = 'ItemListPanelView';

  static defaultProps = {
  };

  constructor(props?: ItemListPanelProps, context?: any) {
    super(props, context);

    this.viewModel.toggleIsExpanded.execute(this.props.defaultExpanded || CommonPanel.defaultProps.defaultExpanded);
  }

  updateOn(viewModel: Readonly<BaseItemListPanelViewModel<any, any, any, any>>) {
    return [
      this.viewModel.isLoading.changed,
      this.viewModel.isExpanded.changed,
    ];
  }

  render() {
    const { className, children, rest, props } = this.restProps(x => {
      const { fill, viewTemplate, search, pager, loadingContent, selectable, highlightSelected, checkmarkSelected, emptyContent } = x;
      return { fill, viewTemplate, search, pager, loadingContent, selectable, highlightSelected, checkmarkSelected, emptyContent };
    });

    if ((props.search || false) !== false && this.viewModel.grid.canFilter() === false) {
      this.logger.warn('Cannot render item list panel search component because data source cannot be filtered');
    }

    const viewType: DataGridViewType = props.viewTemplate instanceof DataGridListViewTemplate ? 'List' : 'Table';

    const searchComponent = this.viewModel.isExpanded.value !== true ?
      undefined :
      this.renderConditional(
        React.isValidElement(props.search),
        () => props.search,
        () => (
          <DataGridView.Search { ...(props.search === true ? {} : props.search) }
            grid={ this.viewModel.grid } viewType={ viewType }
            onClick={ e => { e.stopPropagation(); } }
          />
        ),
      );

    if ((props.search || false) !== false && this.props.headerFormat == null && this.viewModel.isLoading.value === false) {
      rest.headerFormat = (header: any) => (
        <div>
          { header }
          { this.renderNullable(searchComponent, x => x) }
        </div>
      );
    }

    return (
      <CommonPanel { ...rest } className={ this.classNames('ItemListPanel', viewType, className) }
        onSelect={ this.bindEventToCommand(x => x.toggleIsExpanded) }
      >
        <DataGridView { ...props } viewModel={ this.viewModel.grid } search={ false } pager={ false } fill>
          { children }
        </DataGridView>
        {
          this.renderConditional(
            props.pager != null && props.pager !== false && this.viewModel.isLoading.value === false,
            () => this.renderConditional(
              React.isValidElement(props.pager),
              () => props.pager,
              () => <DataGridView.Pager { ...(props.pager === true ? {} : props.pager) } grid={ this.viewModel.grid } viewType={ viewType } fill />,
            ),
          )
        }
      </CommonPanel>
    );
  }
}
