import * as React from 'react';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { PanelItemContext } from '../Panel/Panel';
import { DataGridView, DataGridProps } from '../DataGrid/DataGridView';
import { SearchView, SearchProps } from '../Search/SearchView';
import { CommonPanel, CommonPanelRenderProps } from '../CommonPanel/CommonPanel';
import { ItemListPanelViewModel } from './ItemListPanelViewModel';

export interface ItemListPanelProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends DataGridProps<T, TContext>, CommonPanelRenderProps {
  search?: boolean | SearchProps | {};
}

export interface ItemListPanelViewProps extends BaseViewProps<ItemListPanelViewModel<{}>>, ItemListPanelProps {
}

export class ItemListPanelView extends BaseView<ItemListPanelViewProps, ItemListPanelViewModel<{}>> {
  public static displayName = 'ItemListPanelView';

  static defaultProps = {
  };

  updateOn(viewModel: Readonly<ItemListPanelViewModel<{}>>) {
    return [
      viewModel.isLoading.changed,
    ];
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { search, pager, view, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent } = x;
      return { search, pager, view, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent };
    });

    const searchView = this.wxr.renderNullable(
      props.search,
      x => React.isValidElement(x) ? x : (
        <SearchView viewModel={ this.viewModel.search! }
          disabled={ this.viewModel.isLoading.value }
          onClick={ (e) => { e.stopPropagation(); } }
          { ...(x === true ? {} : x) }
        />
      ),
      undefined,
      x => x !== false && this.viewModel.search != null,
    );

    const headerFormat = (this.props.headerFormat == null && searchView != null) ?
      (content: any) => this.renderPanelHeader(content, searchView) :
      undefined;

    return (
      <CommonPanel headerFormat={ headerFormat } { ...this.trimProps(rest) } className={ this.wxr.classNames('ItemListPanel', className) }>
        { this.renderDataGrid(props) }
      </CommonPanel>
    );
  }

  protected renderPanelHeader(content: any, searchView: any) {
    return (
      <div>
        { content }
        { searchView }
      </div>
    );
  }

  protected renderDataGrid(props: ItemListPanelProps) {
    const { search, ...dataGridProps } = props;

    return (
      <DataGridView { ...dataGridProps } viewModel={ this.viewModel } fill>
        { this.props.children }
      </DataGridView>
    );
  }
}
