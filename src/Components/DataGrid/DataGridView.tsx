'use strict';

import * as React from 'react';

import { Table, TableProps, ButtonGroup, Button, Glyphicon } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import SearchView from '../Search/SearchView';
import PagerView from '../Pager/PagerView';

import { DataGridViewModel, SortDirection } from './DataGridViewModel';

import './DataGrid.less';

interface IDataGridColumnProps {
  fieldName: string;
  header?: string;
  valueSelector?: (x: any) => any;
  sortable?: boolean;
  className?: string;
}

export class DataGridColumn extends React.Component<IDataGridColumnProps, any> {}

class Column {
  constructor(public fieldName: string, public header?: string, public valueSelector?: (x: any) => any, public sortable = false, public className?: string) {
    if (this.header == null) {
      this.header = this.fieldName;
    }

    if (this.valueSelector == null) {
      this.valueSelector = (x: any) => x[this.fieldName];
    }
  }

  public static create(element: React.ReactElement<IDataGridColumnProps>) {
    return new Column(element.props.fieldName, element.props.header, element.props.valueSelector, element.props.sortable, element.props.className);
  }
}

export interface IDataGridView {
  renderColumn: (grid: DataGridViewModel<any>, column: Column, index: number) => any;
  renderCell: (grid: DataGridViewModel<any>, column: Column, index: number, value: any) => any;
  renderRow: (grid: DataGridViewModel<any>, row: any, index: number, cells: any[]) => any;
  renderTable: (grid: DataGridViewModel<any>, data: any[], columns: any, rows: any) => any;
}

export class TableView implements IDataGridView {
  constructor(
    private rowKeySelector: (row: any, index: number, cells: any[]) => any = null,
    striped = true, bordered = true, condensed = true, hover = true, responsive = true
  ) {
    if (rowKeySelector == null) {
      this.rowKeySelector = (row: any, index: number, cells: any[]) => index;
    }

    this.tableProps = { striped, bordered, condensed, hover, responsive };
  }

  private tableProps: TableProps;

  public renderColumn(grid: DataGridViewModel<any>, column: Column, index: number) {
    let sortButtons = column.sortable ? (
      <div className='Column-sortButtons pull-right'>
        <ButtonGroup>
          <Button bsSize="small" active={grid.isSortedBy(column.fieldName, SortDirection.Ascending)} onClick={() => grid.sortBy(column.fieldName, SortDirection.Ascending)}>
            <Glyphicon glyph="sort-by-attributes" />
          </Button>
          <Button bsSize="small" active={grid.isSortedBy(column.fieldName, SortDirection.Descending)} onClick={() => grid.sortBy(column.fieldName, SortDirection.Descending)}>
            <Glyphicon glyph="sort-by-attributes-alt" />
          </Button>
        </ButtonGroup>
      </div>
    ): null;

    return (
      <th key={index} className={column.className}>
        <span className='Column-header'>{column.header}</span>
        {sortButtons}
      </th>
    );
  }

  public renderCell(grid: DataGridViewModel<any>, column: Column, index: number, value: any) {
    return (
      <td key={index}>{value}</td>
    );
  }

  public renderRow(grid: DataGridViewModel<any>, row: any, index: number, cells: any[]) {
    return (
      <tr key={this.rowKeySelector(row, index, cells)}>{cells}</tr>
    );
  }

  public renderTable(grid: DataGridViewModel<any>, data: any[], cols: any, rows: any) {
    return (
      <Table {...this.tableProps}>
        <thead><tr>{cols}</tr></thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
}

interface IDataGridProps extends IBaseViewProps {
  view?: IDataGridView;
  children?: DataGridColumn[]
}

export class DataGridView extends BaseView<IDataGridProps, DataGridViewModel<any>> {
  static defaultProps = {
    view: new TableView()
  }

  private columns: Column[];

  private renderTable() {
    let items = this.state.projectedItems.toArray();

    let columns = this.columns.map((x, i) => this.props.view.renderColumn(this.state, x, i));

    let rows = items.map((row, rowIndex) => {
      let cells = this.columns.map((column, columnIndex) => {
        return this.props.view.renderCell(this.state, column, columnIndex, column.valueSelector(row));
      });

      return this.props.view.renderRow(this.state, row, rowIndex, cells);
    });

    let table = this.props.view.renderTable(this.state, items, columns, rows);

    return table;
  }

  updateOn() {
    return [
      this.state.projectedItems.listChanged,
      this.state.projectedItems.shouldReset
    ]
  }

  initialize() {
    super.initialize();

    this.columns = React.Children.map(this.props.children, (x: React.ReactElement<IDataGridColumnProps>) => {
      return Column.create(x);
    }) || [];
  }

  render() {
    let search = this.state.canFilter() ? (<SearchView viewModel={this.state.search}/>) : null;
    let table = this.renderTable();

    return (
      <div className='DataGrid'>
        {search}
        {table}
        <PagerView first prev next last info limits={[1, 2, 3, null]} viewModel={this.state.pager} />
      </div>
    );
  }
}

export default DataGridView;
