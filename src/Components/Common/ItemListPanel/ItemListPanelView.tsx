import * as React from 'react';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import {
  CommonPanel,
  CommonPanelRenderProps,
} from '../CommonPanel/CommonPanel';
import { DataGridProps, DataGridView } from '../DataGrid/DataGridView';
import { PanelItemContext } from '../Panel/Panel';
import { SearchProps, SearchView } from '../Search/SearchView';
import { ItemListPanelViewModel } from './ItemListPanelViewModel';

export interface ItemListPanelProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext
> extends DataGridProps<T, TContext>, CommonPanelRenderProps {
  search?: boolean | SearchProps | {};
}

export interface ItemListPanelViewProps
  extends BaseViewProps<ItemListPanelViewModel<{}>>,
    ItemListPanelProps {}

export class ItemListPanelView extends BaseView<
  ItemListPanelViewProps,
  ItemListPanelViewModel<{}>
> {
  public static displayName = 'ItemListPanelView';

  static defaultProps: Partial<ItemListPanelProps> = {};

  constructor(props: any) {
    super(props);

    this.handleSearchClick = this.handleSearchClick.bind(this);
  }

  updateOn(viewModel: Readonly<ItemListPanelViewModel<{}>>) {
    return [viewModel.isLoading.changed];
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const {
        search,
        pager,
        loadingContent,
        view,
        viewProps,
        viewTemplate,
        itemsPanelTemplate,
        itemTemplate,
        itemClassName,
        itemStyle,
        itemProps,
        compact,
        emptyContent,
      } = x;
      return {
        search,
        pager,
        loadingContent,
        view,
        viewProps,
        viewTemplate,
        itemsPanelTemplate,
        itemTemplate,
        itemClassName,
        itemStyle,
        itemProps,
        compact,
        emptyContent,
      };
    });

    const searchView =
      props.search &&
      this.viewModel.search &&
      (React.isValidElement(props.search) ? (
        props.search
      ) : (
        <SearchView
          viewModel={this.viewModel.search!}
          disabled={this.viewModel.isLoading.value}
          onClick={this.handleSearchClick}
          {...(props.search === true ? {} : props.search)}
        />
      ));

    const headerFormat =
      this.props.headerFormat == null && searchView != null
        ? (content: any) => this.renderPanelHeader(content, searchView)
        : undefined;

    return (
      <CommonPanel
        headerFormat={headerFormat}
        {...this.trimProps(rest)}
        className={this.wxr.classNames('ItemListPanel', className)}
      >
        {this.renderDataGrid(props)}
      </CommonPanel>
    );
  }

  protected renderPanelHeader(content: any, searchView: any) {
    return (
      <div>
        {content}
        {searchView}
      </div>
    );
  }

  protected renderDataGrid(props: ItemListPanelProps) {
    const { search, ...dataGridProps } = props;

    return (
      <DataGridView {...dataGridProps} viewModel={this.viewModel} fill>
        {this.props.children}
      </DataGridView>
    );
  }

  protected handleSearchClick(e: React.MouseEvent<any>) {
    e.stopPropagation();
  }
}
