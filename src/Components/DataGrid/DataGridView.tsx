'use strict';

import * as React from 'react';

import { Table, TableProps, ButtonGroup, Button, Glyphicon } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import { IDataGridViewModel, SortDirection } from './DataGridViewModel';

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
  renderColumn: (grid: IDataGridViewModel, column: Column, index: number) => any;
  renderCell: (grid: IDataGridViewModel, column: Column, index: number, value: any) => any;
  renderRow: (grid: IDataGridViewModel, row: any, index: number, cells: any[]) => any;
  renderTable: (grid: IDataGridViewModel, data: any[], columns: any, rows: any) => any;
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

  public renderColumn(grid: IDataGridViewModel, column: Column, index: number) {
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

  public renderCell(grid: IDataGridViewModel, column: Column, index: number, value: any) {
    return (
      <td key={index}>{value}</td>
    );
  }

  public renderRow(grid: IDataGridViewModel, row: any, index: number, cells: any[]) {
    return (
      <tr key={this.rowKeySelector(row, index, cells)}>{cells}</tr>
    );
  }

  public renderTable(grid: IDataGridViewModel, data: any[], cols: any, rows: any) {
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
  children?: any
}

export class DataGridView extends BaseView<IDataGridProps, IDataGridViewModel> {
  static defaultProps = {
    view: new TableView()
  }

  render() {
    let items = this.state.getItems();

    let columnDefinitions = React.Children.map(this.props.children, (x: React.ReactElement<IDataGridColumnProps>) => {
      return Column.create(x);
    });

    let columns = columnDefinitions.map((x, i) => this.props.view.renderColumn(this.state, x, i));

    let rows = items.map((row, rowIndex) => {
      let cells = columnDefinitions.map((column, columnIndex) => {
        return this.props.view.renderCell(this.state, column, columnIndex, column.valueSelector(row));
      });

      return this.props.view.renderRow(this.state, row, rowIndex, cells);
    });

    let table = this.props.view.renderTable(this.state, items, columns, rows);

    return (
      <div className='DataGrid'>
        {table}
      </div>
    );
  }
}

export default DataGridView;
