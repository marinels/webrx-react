'use strict';

import * as React from 'react';

import { Table, TableProps, ButtonGroup, Button, Glyphicon } from 'react-bootstrap';

import './DataGrid.less';

export class DataGridColumn {
  constructor(public fieldName: string, public header?: string, public valueSelector?: (x: any) => any, public sortable = false, public className?: string) {
    if (this.header == null) {
      this.header = this.fieldName;
    }

    if (this.valueSelector == null) {
      this.valueSelector = (x: any) => x[this.fieldName];
    }
  }
}

export interface IDataGridView {
  renderColumn: (grid: DataGrid, column: DataGridColumn, index: number) => any;
  renderCell: (grid: DataGrid, column: DataGridColumn, index: number, value: any) => any;
  renderRow: (grid: DataGrid, row: any, index: number, cells: any[]) => any;
  renderTable: (grid: DataGrid, data: any[], columns: any, rows: any) => any;
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

  public renderColumn(grid: DataGrid, column: DataGridColumn, index: number) {
    let sortButtons = (grid.props.sorter && column.sortable) ? (
      <div className='Column-sortButtons pull-right'>
        <ButtonGroup>
          <Button bsSize="small" active={grid.isSortedBy(column, true)} onClick={() => grid.props.sorter(column, index, true)}>
            <Glyphicon glyph="sort-by-attributes" />
          </Button>
          <Button bsSize="small" active={grid.isSortedBy(column, false)} onClick={() => grid.props.sorter(column, index, false)}>
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

  public renderCell(grid: DataGrid, column: DataGridColumn, index: number, value: any) {
    return (
      <td key={index}>{value}</td>
    );
  }

  public renderRow(grid: DataGrid, row: any, index: number, cells: any[]) {
    return (
      <tr key={this.rowKeySelector(row, index, cells)}>{cells}</tr>
    );
  }

  public renderTable(grid: DataGrid, data: any[], cols: any, rows: any) {
    return (
      <Table {...this.tableProps}>
        <thead><tr>{cols}</tr></thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
}

export interface IDataGridSorter {
  (column: DataGridColumn, index: number, ascending: boolean): void;
}

interface IDataGridProps {
  data?: any[];
  columns: DataGridColumn[];
  sorter?: IDataGridSorter;
  view?: IDataGridView;
}

interface IDataGridState {
  data: any[];
  view: IDataGridView;
  sortField?: string;
  sortAscending?: boolean;
}

export class DataGrid extends React.Component<IDataGridProps, IDataGridState> {
  constructor(props?: IDataGridProps, context?: any) {
    super(props, context);

    this.state = {} as IDataGridState;
    this.state.data = this.props.data || [];
    this.state.view = this.props.view || new TableView();
  }

  public isSortedBy(column: DataGridColumn, sortedAscending: boolean) {
    return column.fieldName === this.state.sortField && this.state.sortAscending === sortedAscending;
  }

  render() {
    let columns = this.props.columns.map((x, i) => this.state.view.renderColumn(this, x, i));
    let rows = this.state.data.map((row, rowIndex) => {
      let cells = this.props.columns.map((column, columnIndex) => {
        return this.state.view.renderCell(this, column, columnIndex, column.valueSelector(row));
      });

      return this.state.view.renderRow(this, row, rowIndex, cells);
    });

    let table = this.state.view.renderTable(this, this.state.data, columns, rows);

    return (
      <div className='DataGrid'>
        {table}
      </div>
    );
  }
}

export default DataGrid;
