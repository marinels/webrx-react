import * as React from 'react';
import { Icon } from 'react-fa';
import { Observable } from 'rxjs';

import { SortDirection } from '../../../Utils/Compare';
import { BaseView, BaseViewProps } from '../../React';
import { CommandButton } from '../CommandButton/CommandButton';
import { GridView } from '../ListItems/GridView';
import { GridViewColumns } from '../ListItems/GridViewColumn';
import { ListItemsProps, ListItemsView } from '../ListItems/ListItemsView';
import { Loading } from '../Loading/Loading';
import { PagerProps, PagerView } from '../Pager/PagerView';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';
import { DataGridViewModel, DataSourceRequest } from './DataGridViewModel';

export interface DataGridProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext,
> extends ListItemsProps<T, TContext> {
  pager?: boolean | PagerProps | {};
  loadingContent?: React.ReactNode | (() => React.ReactNode);
}

export interface DataGridViewProps extends BaseViewProps<DataGridViewModel<{}>>, DataGridProps {
  fill?: boolean;
}

export class DataGridView extends BaseView<DataGridViewProps, DataGridViewModel<{}>> {
  public static displayName = 'DataGridView';

  public static readonly Columns = GridViewColumns;

  static defaultProps: Partial<DataGridProps> = {
    loadingContent: 'Loading Data...',
  };

  updateOn(viewModel: Readonly<DataGridViewModel<{}>>) {
    return [
      viewModel.isLoading.changed,
    ];
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const {
        pager, loadingContent, fill, view, viewProps, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName,
        itemStyle, itemProps, compact, emptyContent,
      } = x;
      return {
        pager, loadingContent, fill, view, viewProps, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName,
        itemStyle, itemProps, compact, emptyContent,
      };
    });

    return (
      <div { ...rest } className={ this.wxr.classNames('DataGrid', className) }>
        {
          Loading.renderLoadable(
            this.viewModel.isLoading,
            props.loadingContent!,
            () => {
              const dataGridView = ListItemsView.getListItemsView(
                this.props,
                this.renderDefaultDataGridView.bind(this),
              );

              const pagerView = this.wxr
                .renderNullable(
                  props.pager,
                  x => React.isValidElement(x) ? x : (
                    <PagerView viewModel={ this.viewModel.pager! } { ...(x === true ? {} : x) } />
                  ),
                  undefined,
                  x => x !== false && this.viewModel.pager != null,
                );

              return (
                <div className='DataGrid-container'>
                  <ListItemsView
                    viewModel={ this.viewModel }
                    view={ dataGridView }
                    viewProps={ props.viewProps }
                    viewTemplate={ props.viewTemplate }
                    itemsPanelTemplate={ props.itemsPanelTemplate }
                    itemTemplate={ props.itemTemplate }
                    itemClassName={ props.itemClassName }
                    itemStyle={ props.itemStyle }
                    itemProps={ props.itemProps }
                    compact={ props.compact }
                    emptyContent={ props.emptyContent }
                  />
                  { pagerView }
                </div>
              );
            },
          )
        }
      </div>
    );
  }

  protected renderDefaultDataGridView(props: DataGridProps) {
    return (
      <GridView headerTemplate={ this.renderHeader.bind(this) }>
        { props.children }
      </GridView>
    );
  }

  protected renderHeader(fragment: PanelFragment, item: {} | undefined, field: string | undefined) {
    if (field == null) {
      return fragment;
    }

    return (
      <CommandButton className='DataGrid-header' block bsStyle='link'
        command={ this.viewModel.toggleSortDirection } commandParameter={ field }
      >
        { fragment }
        { this.renderSortIcon(field, this.viewModel.requests.value) }
      </CommandButton>
    );
  }

  protected renderSortIcon(field: string | undefined, request: DataSourceRequest | undefined) {
    const iconName = this.getSortIconName(field, request);

    if (String.isNullOrEmpty(iconName)) {
      return null;
    }

    return (
      <Icon name={ iconName } size='lg' />
    );
  }

  protected getSortIconName(field: string | undefined, request: DataSourceRequest | undefined) {
    if (
      request == null ||
      request.sort == null ||
      request.sort.field == null ||
      request.sort.direction == null ||
      request.sort.field !== field
    ) {
      return undefined;
    }

    if (request.sort.direction === SortDirection.Ascending) {
      return 'sort-asc';
    }
    else if (request.sort.direction === SortDirection.Descending) {
      return 'sort-desc';
    }

    return undefined;
  }
}
