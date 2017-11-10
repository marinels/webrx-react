import * as React from 'react';
import { Observable } from 'rxjs';
import { Icon } from 'react-fa';

import { BaseView, BaseViewProps } from '../../React';
import { SortDirection } from '../../../Utils/Compare';
import { ListItemsView, ListItemsProps } from '../ListItems/ListItemsView';
import { PanelFragment } from '../Panel/Panel';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { GridView, GridViewProps, GridViewColumn } from '../ListItems/GridView';
import { CommandButton } from '../CommandButton/CommandButton';
import { PagerView, PagerProps } from '../Pager/PagerView';
import { DataGridViewModel, DataSourceRequest } from './DataGridViewModel';

export interface DataGridProps extends ListItemsProps {
  pager?: boolean | PagerProps | {};
}

export interface DataGridViewProps extends BaseViewProps<DataGridViewModel<{}>>, DataGridProps {
  fill?: boolean;
}

export class DataGridView extends BaseView<DataGridViewProps, DataGridViewModel<{}>> {
  public static displayName = 'DataGridView';

  static defaultProps = {
  };

  updateOn(viewModel: Readonly<DataGridViewModel<{}>>) {
    return [
      viewModel.isLoading.changed,
    ];
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { pager, fill, view, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent } = x;
      return { pager, fill, view, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent };
    });

    return this.wxr.renderSizedLoadable(this.viewModel.isLoading,
      'Loading Data...',
      25,
      () => {
        const dataGridView = ListItemsView.getListItemsView(this.props, this.renderDefaultDataGridView.bind(this));

        const pagerView = this.wxr.renderNullable(
          props.pager,
          x => React.isValidElement(x) ? x : (
            <PagerView viewModel={ this.viewModel.pager! } { ...(x === true ? {} : x) } />
          ),
          undefined,
          x => x !== false && this.viewModel.pager != null,
        );

        return (
          <div { ...rest } className={ this.wxr.classNames('DataGrid', className) }>
            <ListItemsView
              viewModel={ this.viewModel }
              view={ dataGridView }
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
    if (request == null || request.sort == null || request.sort.field == null || request.sort.direction == null || request.sort.field !== field) {
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
