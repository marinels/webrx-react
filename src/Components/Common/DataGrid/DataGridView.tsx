import * as React from 'react';
import * as classNames from 'classnames';

import { Table, TableProps, Button, ListGroup, ListGroupItem } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import { SearchView } from '../Search/SearchView';
import { PagerView, StandardLimits } from '../Pager/PagerView';
import { Icon } from 'react-fa';

import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';

import './DataGrid.less';

interface DataGridColumnProps {
  fieldName: string;
  header?: string;
  valueSelector?: (x: any) => any;
  sortable?: boolean;
  className?: string;
  width?: number | string;
}

export class DataGridColumn extends React.Component<DataGridColumnProps, any> {
  public static displayName = 'DataGridColumn';

  static defaultProps = {
    sortable: false,
  };
}

export interface DataGridViewTemplate {
  renderColumn: (column: DataGridColumnProps, index: number, grid: DataGridViewModel<any>, view: DataGridView) => any;
  renderCell: (value: any, column: DataGridColumnProps, index: number, grid: DataGridViewModel<any>, view: DataGridView) => any;
  renderRow: (row: any, cells: any[], index: number, grid: DataGridViewModel<any>, view: DataGridView) => any;
  renderTable: (rows: any[], columns: any[], data: any[], grid: DataGridViewModel<any>, view: DataGridView) => any;
}

export class DataGridListViewTemplate<T> implements DataGridViewTemplate {
  public static displayName = 'DataGridListViewTemplate';

  constructor(
    protected renderItem: (row: T, index: number, grid: DataGridViewModel<T>, view: DataGridView) => any = x => x,
    protected keySelector: (row: T, index: number, grid: DataGridViewModel<T>, view: DataGridView) => any = (r, i) => i,
    protected renderItemContainer?: (contents: any, row: T, index: number, grid: DataGridViewModel<T>, view: DataGridView) => any
  ) {
    this.renderItemContainer = this.renderItemContainer || this.defaultRenderItemContainer;
  }

  protected defaultRenderItemContainer(contents: any, row: T, index: number, grid: DataGridViewModel<T>, view: DataGridView) {
    return (
      <ListGroupItem className='DataGrid-row' key={ this.keySelector(row, index, grid, view) } active={grid.selectedItem() === row}>
        <div className='DataGrid-rowContainer' onClick={() => grid.selectItem.execute(row)}>
          { contents }
        </div>
      </ListGroupItem>
    );
  }

  renderColumn(column: DataGridColumnProps, index: number, grid: DataGridViewModel<any>, view: DataGridView): any {
    return null;
  }

  renderCell(value: any, column: DataGridColumnProps, index: number, grid: DataGridViewModel<any>, view: DataGridView): any {
    return null;
  }

  renderRow(row: any, cells: any[], index: number, grid: DataGridViewModel<any>, view: DataGridView) {
    return this.renderItemContainer(this.renderItem(row, index, grid, view), row, index, grid, view);
  }

  renderTable(rows: any[], columns: any[], data: any[], grid: DataGridViewModel<any>, view: DataGridView) {
    return (
      <div className='DataGrid-listView'>
        <ListGroup>
          {
            (rows || [])
              .asEnumerable()
              .defaultIfEmpty(
                <div key='empty' className='DataGrid-empty text-muted'>Nothing to Display...</div>
              )
              .toArray()
          }
        </ListGroup>
      </div>
    );
  }
}

export class DataGridTableViewTemplate implements DataGridViewTemplate {
  public static displayName = 'DataGridTableViewTemplate';

  private tableProps: TableProps;

  constructor(
    private rowKeySelector: (row: any, index: number, cells: any[]) => any = (r, i) => i,
    striped = false, bordered = true, condensed = true, hover = true, responsive = true) {

    this.tableProps = { striped, bordered, condensed, hover, responsive };
  }

  private renderSortIcon(column: DataGridColumnProps, index: number, grid: DataGridViewModel<any>, view: DataGridView) {
    let icon: any = null;

    if (grid.canSort() && column.sortable) {
      let iconName = '';

      if (grid.isSortedBy(column.fieldName, SortDirection.Ascending) === true) {
        iconName = 'sort-asc';
      }
      else if (grid.isSortedBy(column.fieldName, SortDirection.Descending) === true) {
        iconName = 'sort-desc';
      }

      return (
        <span className='DataGrid-columnSortIcon'>
          { String.isNullOrEmpty(iconName) ? null : <Icon name={iconName} size='lg' /> }
        </span>
      );
    }

    return icon;
  }

  public renderColumn(column: DataGridColumnProps, index: number, grid: DataGridViewModel<any>, view: DataGridView) {
    let sortIcon = this.renderSortIcon(column, index, grid, view);
    let header = (
      <span className='DataGrid-columnHeader'>
        {column.header}
      </span>
    );

    let headerContainer = sortIcon == null ? (
      <div className='DataGrid-columnContainer'>
        {header}
      </div>
    ) : (
      <Button className='DataGrid-columnContainer' bsStyle='link'
        onClick={view.bindEventToCommand(x => x.toggleSortDirection, () => column.fieldName)}
      >
        {header}
        {sortIcon}
      </Button>
    );

    return (
      <th key={index} className={classNames('DataGrid-column', column.className)} width={column.width}>
        {headerContainer}
      </th>
    );
  }

  public renderCell(value: any, column: DataGridColumnProps, index: number, grid: DataGridViewModel<any>, view: DataGridView) {
    return (
      <td className={column.className} key={index}>{value}</td>
    );
  }

  public renderRow(row: any, cells: any[], index: number, grid: DataGridViewModel<any>, view: DataGridView) {
    const rowClasses = classNames('DataGrid-row', {
      'DataGrid-row--selected': grid.selectedItem() === row,
    });

    return (
      <tr className={rowClasses} key={this.rowKeySelector(row, index, cells)} onClick={() => grid.selectItem.execute(row)}>{cells}</tr>
    );
  }

  public renderTable(rows: any[], columns: any[], data: any[], grid: DataGridViewModel<any>, view: DataGridView) {
    return (
      <Table className='DataGrid-tableView' {...this.tableProps as any}>
        <thead>
          <tr>
            {
              (columns || [])
                .asEnumerable()
                .defaultIfEmpty(
                  <th key='empty'>
                    <div className='DataGrid-empty text-muted'>No Columns Defined...</div>
                  </th>
                )
                .toArray()
            }
          </tr>
        </thead>
        <tbody>
          {
            (rows || [])
              .asEnumerable()
              .defaultIfEmpty(
                <tr key='empty'>
                  <td>
                    <div className='DataGrid-empty text-muted'>No Rows to Display...</div>
                  </td>
                </tr>
              )
              .toArray()
          }
        </tbody>
      </Table>
    );
  }
}

interface DataGridProps extends IBaseViewProps {
  view?: DataGridViewTemplate;
  hideSearch?: boolean;
  pagerLimits?: number[];
  children?: DataGridColumn[];
}

export class DataGridView extends BaseView<DataGridProps, DataGridViewModel<any>> {
  public static displayName = 'DataGridView';

  static defaultProps = {
    view: new DataGridTableViewTemplate(),
    hideSearch: false,
    pagerLimits: StandardLimits,
  };

  private columns: DataGridColumnProps[];

  private renderGrid(items: any[]) {
    let columns = this.columns.map((x, i) => this.props.view.renderColumn(x, i, this.state, this));

    let rows = items.map((row, rowIndex) => {
      let cells = this.columns.map((column, columnIndex) => {
        return this.props.view.renderCell(column.valueSelector(row), column, columnIndex, this.state, this);
      });

      return this.props.view.renderRow(row, cells, rowIndex, this.state, this);
    });

    let table = this.props.view.renderTable(rows, columns, items, this.state, this);

    return table;
  }

  private createColumns(columns: DataGridColumn[]) {
    this.columns = React.Children.map(columns, (col: React.ReactElement<DataGridColumnProps>) => {
      let column = Object.assign<DataGridColumnProps>({}, col.props);

      if (column.header == null) {
        column.header = column.fieldName;
      }

      if (column.valueSelector == null) {
        column.valueSelector = ((x: any) => x[column.fieldName]);
      }

      return column;
    });
  }

  updateOn() {
    return [
      this.state.projectedItems.listChanged,
      this.state.selectedItem.changed,
    ];
  }

  render() {
    let search: any;
    let grid: any;
    let pager: any;

    let items = this.state.projectedItems.toArray() || [];

    if (this.columns == null) {
      let columns: DataGridColumn[];

      if (React.Children.count(this.props.children) === 0) {
        // no columns were provided, try to auto-create columns
        if (items.length > 0) {
          columns = Object
            .keys(items[0] || {})
            .map(x => (
              <DataGridColumn fieldName={x} />
            )) as any;
        }

      }
      else {
        // columns were provided declaratively
        columns = this.props.children;
      }

      if (columns != null) {
        this.createColumns(columns);
      }
    }

    if (this.columns != null) {
      search = (this.props.hideSearch === true || this.state.canFilter() === false) ? null : (
        <SearchView viewModel={this.state.search}/>
      );
      grid = this.renderGrid(items);

      if (this.props.pagerLimits != null && this.props.pagerLimits.length > 0) {
        pager = (
          <PagerView viewModel={this.state.pager} limits={this.props.pagerLimits} />
        );
      }
    }

    return (
      <div className='DataGrid'>
        {search}
        {grid}
        {pager}
      </div>
    );
  }

  public selectItem(item: any, index?: number) {
    if (index == null) {
      this.state.selectItem.execute(item);
    }
    else {
      this.state.selectIndex.execute(index);
    }
  }
}
