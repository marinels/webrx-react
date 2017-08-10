import * as React from 'react';
import { Observable } from 'rxjs';
import { Icon } from 'react-fa';
import { Table, TableProps, OverlayTrigger, OverlayTriggerProps } from 'react-bootstrap';

import { wxr, BaseView, BaseViewProps } from '../../React';
import { SearchView, SearchProps } from '../Search/SearchView';
import { PagerView, PagerProps } from '../Pager/PagerView';
import { CommandButton } from '../CommandButton/CommandButton';
import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';
import { BaseListViewTemplate, ListViewRenderTemplate, ListViewRenderTemplateProps } from '../List/ListView';
import { NavButton } from '../List/NavButton';

export type ReadonlyDataGridViewModel<TItem> = Readonly<DataGridViewModel<any, TItem>>;

export type ColumnRenderFunction = (
  item: any,
  index: number | undefined,
  column: DataGridColumnProps,
  columnIndex: number,
  columns: DataGridColumnProps[],
  viewModel: ReadonlyDataGridViewModel<any>,
  view: DataGridView,
) => any;

export type ColumnContainerRenderFunction = (
  content: any,
  item: any,
  index: number,
  column: DataGridColumnProps,
  columnIndex: number,
  columns: DataGridColumnProps[],
  viewModel: ReadonlyDataGridViewModel<any>,
  view: DataGridView,
) => any;

export interface DataGridColumnProps {
  fieldName?: string;
  header?: any;
  sortable?: boolean;
  className?: string;
  width?: number | string;
  tooltip?: ColumnRenderFunction;
  renderCell?: ColumnRenderFunction;
  renderCellContainer?: ColumnContainerRenderFunction;
}

export class DataGridColumn extends React.Component<DataGridColumnProps, any> {
  public static displayName = 'DataGridColumn';

  static defaultProps = {
    fieldName: '',
  };
}

export interface NavDataGridColumnProps extends DataGridColumnProps {
  buttonProps: ColumnRenderFunction;
}

export class NavDataGridColumn extends React.Component<NavDataGridColumnProps, any> {
  public static displayName = 'NavDataGridColumn';

  static defaultProps = {
    fieldName: 'nav',
    header: '',
    className: 'navColumn',
    width: 1,
    renderCell: (item: any, index: number, column: NavDataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<any>, view: DataGridView) => {
      const props = wxr.renderNullable(column.buttonProps, buttonProps => buttonProps(item, index, column, columnIndex, columns, viewModel, view));

      return (
        <NavButton { ...props } />
      );
    },
    renderCellContainer: (x: any) => x,
  };
}

export interface DataGridViewTemplate<TData> extends ListViewRenderTemplate<TData, DataGridView> {
}

export class DataGridListViewTemplate<TData> extends BaseListViewTemplate<TData, TData, DataGridView> implements DataGridViewTemplate<TData> {
  public static displayName = 'DataGridListViewTemplate';

  constructor(
    renderItem?: (item: TData, index: number, viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any,
    renderItemActions?: (item: TData, index: number, viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any,
    keySelector?: (item: TData, index: number, viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any,
    renderTemplateContainer?: (content: any, item: TData, index: number, viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any,
  ) {
    super(
      renderItem == null ? undefined : (item, data, index, viewModel: ReadonlyDataGridViewModel<TData>, view) => renderItem(data, index, viewModel, view),
      renderItemActions == null ? undefined : (item, data, index, viewModel: ReadonlyDataGridViewModel<TData>, view) => renderItemActions(data, index, viewModel, view),
      keySelector == null ? undefined : (item, data, index, viewModel: ReadonlyDataGridViewModel<TData>, view) => keySelector(data, index, viewModel, view),
      renderTemplateContainer == null ? undefined : (content, item, data, index, viewModel: ReadonlyDataGridViewModel<TData>, view) => renderTemplateContainer(content, data, index, viewModel, view),
    );
  }

  getClassName() {
    return 'List';
  }

  getItems(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    return viewModel.projectedItems.value;
  }

  getItemData(item: TData, index: number, viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    return item;
  }
}

export class DataGridTableViewTemplate<TData> implements DataGridViewTemplate<TData> {
  public static displayName = 'DataGridTableViewTemplate';

  private readonly tableProps: TableProps;

  protected readonly renderCellContainer: (content: any, item: TData, index: number, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any;
  protected readonly renderRowContainer: (content: any, item: TData, index: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any;
  protected readonly renderHeaderContainer: (content: any, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any;

  constructor(
    protected readonly renderItem: ColumnRenderFunction = x => x,
    protected readonly rowKeySelector: (item: TData, index: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any = (r, i) => i,
    renderCellContainer?: (content: any, item: TData, index: number, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any,
    renderRowContainer?: (content: any, item: TData, index: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any,
    renderHeaderContainer?: (content: any, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) => any,
    protected readonly enableAutomaticColumns = true,
    bordered = false, hover = true, striped = false, condensed = true, responsive = true,
  ) {
    this.tableProps = { bordered, hover, striped, condensed, responsive };
    this.renderCellContainer = renderCellContainer || this.renderDefaultCellContainer;
    this.renderRowContainer = renderRowContainer || this.renderDefaultRowContainer;
    this.renderHeaderContainer = renderHeaderContainer || this.renderDefaultHeaderContainer;
  }

  protected renderColumnTooltip(content: any, item: any, index: number | undefined, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    if (column.tooltip != null) {
      const tooltip = column.tooltip(item, index, column, columnIndex, columns, viewModel, view);

      if (React.isValidElement<OverlayTriggerProps>(tooltip)) {
        if (tooltip.type === OverlayTrigger) {
          return React.cloneElement(tooltip as any, { key: content.key }, content);
        }
        else {
          return (
            <OverlayTrigger key={ content.key } placement={ tooltip.props.placement || 'top' } overlay={ tooltip } >
              { content }
            </OverlayTrigger>
          );
        }
      }
      else {
        return content;
      }
    }
    else {
      return content;
    }
  }

  protected renderDefaultCellContainer(content: any, item: any, index: number, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    content = (
      <td className={ wxr.classNames('DataGrid-cell', column.className) } key={ columnIndex }>
        { content }
      </td>
    );

    return this.renderColumnTooltip(content, item, index, column, columnIndex, columns, viewModel, view);
  }

  protected renderDefaultRowContainer(content: any, item: any, index: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    const rowClasses = wxr.classNames('DataGrid-row', {
      'DataGrid-row--selected': view.props.highlightSelected === true && viewModel.selectedItem.value === item,
    });

    const onClick = view.props.selectable !== true ? null : wxr.bindEventToCommand(viewModel, x => x.selectItem, () => item);

    return (
      <tr className={ rowClasses } key={ this.rowKeySelector(item, index, columns, viewModel, view) } onClick={ onClick }>
        { content }
      </tr>
    );
  }

  protected renderDefaultHeaderContainer(content: any, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    content = (
      <th key={ columnIndex } className={ wxr.classNames('DataGrid-column', column.className) } style={ ({ width: column.width }) }>
        { content }
      </th>
    );

    return this.renderColumnTooltip(content, null, undefined, column, columnIndex, columns, viewModel, view);
  }

  protected getColumnDefinitions(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView): DataGridColumn[] | undefined {
    let columns: any[] = React.Children
      .toArray(view.props.children) || [];

    if (this.enableAutomaticColumns === true && columns.length === 0) {
      const items = (viewModel.data.value || []);

      if (items.length > 0 && items[0] != null) {
        // auto-generate columns
        columns = Object
          .keys(items[0])
          .map(x => (
            <DataGridColumn fieldName={ x } />
          ));
      }
    }

    return columns;
  }

  protected createColumns(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    let columns: DataGridColumnProps[] | undefined;

    const columnDefinitions = this.getColumnDefinitions(viewModel, view);

    if (columnDefinitions != null && React.Children.count(columnDefinitions) > 0) {
      columns = React.Children
        .map(columnDefinitions, x => x)
        .filterNull()
        .map((x: React.ReactElement<DataGridColumnProps>) => {
          const column = Object.assign<DataGridColumnProps>({}, x.props);

          if (column.header == null) {
            column.header = column.fieldName;
          }

          if (column.renderCell == null) {
            column.renderCell = ((item: any) => String.isNullOrEmpty(column.fieldName) ? undefined : item[column.fieldName]);
          }

          return column;
        });
    }

    return columns;
  }

  protected renderEmptyColumns(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    return (
      <th key='empty'>
        <div key='columns-empty' className='DataGrid-empty text-muted'>No Columns Defined...</div>
      </th>
    );
  }

  protected renderColumns(columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    return (
      <tr>
        {
          columns
            .asIterable()
            .map((x, i) => this.renderColumnHeader(x, i, columns, viewModel, view))
            .defaultIfEmpty(this.renderEmptyColumns(viewModel, view))
            .toArray()
        }
      </tr>
    );
  }

  protected renderColumnHeader(column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    const sortIcon = this.renderSortIcon(column, columnIndex, columns, viewModel, view);

    const headerContent = (
      <span className='DataGrid-columnHeader'>
        { column.header }
      </span>
    );

    const header = wxr.renderNullable(
      sortIcon,
      x => (
        <CommandButton className='DataGrid-columnContainer' bsStyle='link' command={ viewModel.toggleSortDirection } commandParameter={ column.fieldName }>
          { headerContent }
          { x }
        </CommandButton>
      ),
      () => (<div className='DataGrid-columnContainer'>{ headerContent }</div>),
    );

    return this.renderHeaderContainer(header, column, columnIndex, columns, viewModel, view);
  }

  protected renderSortIcon(column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    let icon: any;

    if (viewModel.canSort() && column.sortable) {
      let iconName = '';

      if (viewModel.isSortedBy(column.fieldName, SortDirection.Ascending) === true) {
        iconName = 'sort-asc';
      }
      else if (viewModel.isSortedBy(column.fieldName, SortDirection.Descending) === true) {
        iconName = 'sort-desc';
      }

      return (
        <span className='DataGrid-columnSortIcon'>
          { wxr.renderConditional(String.isNullOrEmpty(iconName) === false, () => (<Icon name={ iconName } size='lg' />)) }
        </span>
      );
    }

    return icon;
  }

  protected renderEmptyContent(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    return wxr.renderConditional(view.props.emptyContent instanceof Function, () => {
      return view.props.emptyContent.apply(this, [ viewModel, view ]);
    }, () => view.props.emptyContent);
  }

  protected renderRows(columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    return (viewModel.projectedItems.value || [])
      .asIterable()
      .map((x, i) => this.renderRow(x, i, columns, viewModel, view))
      .defaultIfEmpty(
        <tr key='rows-empty'>
          <td colSpan={ columns.length + 1 }>
            <div className='DataGrid-empty text-muted'>
              { this.renderEmptyContent(viewModel, view) }
            </div>
          </td>
        </tr>,
      )
      .toArray();
  }

  protected renderRow(item: TData, index: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    const rowClasses = wxr.classNames('DataGrid-row', {
      'DataGrid-row--selected': view.props.highlightSelected === true && viewModel.selectedItem.value === item,
    });

    const rowContent = (columns || [])
      .asIterable()
      .map((x, i) => this.renderCell(item, index, x, i, columns, viewModel, view))
      .defaultIfEmpty(this.renderEmptyColumns(viewModel, view))
      .toArray();

    return this.renderRowContainer(rowContent, item, index, columns, viewModel, view);
  }

  protected renderCell(item: TData, index: number, column: DataGridColumnProps, columnIndex: number, columns: DataGridColumnProps[], viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    const cellContent = wxr.renderNullable(
      column.renderCell,
      renderCell => renderCell(item, index, column, columnIndex, columns, viewModel, view),
    );

    const cellContainer = wxr.renderNullable(
      column.renderCellContainer,
      renderCellContainer => renderCellContainer(cellContent, item, index, column, columnIndex, columns, viewModel, view),
      () => (<div className='DataGrid-cellContainer'>{ cellContent }</div>),
    );

    return this.renderCellContainer(cellContainer, item, index, column, columnIndex, columns, viewModel, view);
  }

  public initialize(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    // do nothing
  }

  public cleanup(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    // do nothing
  }

  public render(viewModel: ReadonlyDataGridViewModel<TData>, view: DataGridView) {
    const columns = this.createColumns(viewModel, view) || [];

    const props = Object.assign({}, this.tableProps, {
      bordered: view.isOnlyView() === true ? false : this.tableProps.bordered,
    });

    return (
      <Table className='DataGrid-tableView' { ...props }>
        <thead>{ this.renderColumns(columns, viewModel, view) }</thead>
        <tbody>{ this.renderRows(columns, viewModel, view) }</tbody>
      </Table>
    );
  }
}

export type DataGridViewType = 'Table' | 'List';

export interface DataGridComponentProps {
  grid: ReadonlyDataGridViewModel<any>;
  viewType: DataGridViewType;
  fill?: boolean;
}

export interface DataGridSearchProps extends DataGridComponentProps, SearchProps, React.HTMLProps<any> {
}

export class DataGridSearch extends React.Component<DataGridSearchProps, any> {
  render() {
    const { className, props, rest } = this.restProps(x => {
      const { grid, viewType } = x;
      return { grid, viewType };
    });

    return wxr.renderConditional(props.grid.canFilter() === true, () => (
      <SearchView { ...rest } viewModel={ props.grid.search }
        className={ wxr.classNames('DataGrid', className, { Table: props.viewType === 'Table' }) }
      />
    ));
  }
}

export interface DataGridPagerProps extends DataGridComponentProps, PagerProps {
}

export class DataGridPager extends React.Component<DataGridPagerProps, any> {
  render() {
    const { className, props, rest } = this.restProps(x => {
      const { grid, viewType } = x;
      return { grid, viewType };
    });

    return (
      <PagerView { ...rest } viewModel={ props.grid.pager }
        className={ wxr.classNames('DataGrid', className) }
      />
    );
  }
}

export interface DataGridProps extends ListViewRenderTemplateProps {
  fill?: boolean;
  viewTemplate?: DataGridViewTemplate<any>;
  search?: boolean | SearchProps | any;
  pager?: boolean | PagerProps | any;
  loadingContent?: any;
}

export interface DataGridViewProps extends DataGridProps, BaseViewProps {
}

export class DataGridView extends BaseView<DataGridViewProps, DataGridViewModel<any, any>> {
  public static displayName = 'DataGridView';

  public static Search = DataGridSearch;
  public static Pager = DataGridPager;

  static defaultProps = {
    viewTemplate: new DataGridTableViewTemplate<any>(),
    loadingContent: 'Loading Data...',
    emptyContent: 'No Data...',
  };

  public isOnlyView() {
    return (
      this.props != null &&
      (this.props.search == null || this.props.search === false) &&
      (this.props.pager == null || this.props.pager === false)
    );
  }

  initialize() {
    super.initialize();

    this.props.viewTemplate!.initialize(this.state, this);
  }

  updated(prevProps: DataGridViewProps) {
    // if the view was changed then we need to re-init
    if (prevProps.viewTemplate !== this.props.viewTemplate) {
      // cleanup old view
      prevProps.viewTemplate!.cleanup(this.state, this);

      // initialize new view
      this.props.viewTemplate!.initialize(this.state, this);
    }
  }

  cleanup() {
    super.cleanup();

    this.props.viewTemplate!.cleanup(this.state, this);
  }

  updateOn() {
    const watches = [
      this.state.isLoading.changed,
      this.state.projectedItems.changed,
      this.state.hasProjectionError.changed,
    ];

    if (this.props.selectable === true) {
      watches.push(this.state.selectedItem.changed);
    }

    return watches;
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { fill, viewTemplate, search, pager, selectable, highlightSelected, checkmarkSelected, loadingContent, emptyContent } = x;
      return { fill, viewTemplate, search, pager, selectable, highlightSelected, checkmarkSelected, loadingContent, emptyContent };
    });

    if ((props.search || false) !== false && this.state.canFilter() === false) {
      this.logger.warn('Cannot render grid search component because data source cannot be filtered');
    }

    return this.renderSizedLoadable(this.state.isLoading, props.loadingContent, '1.5em', () => {
      const viewType: DataGridViewType = props.viewTemplate instanceof DataGridListViewTemplate ? 'List' : 'Table';
      const grid = props.viewTemplate!.render(this.state, this);

      return this.renderConditional(
        this.isOnlyView() === true,
        () => React.cloneElement(
          grid,
          Object.assign({ className: this.classNames('DataGrid', grid.props.className, className) }, rest),
        ),
        () => (
          <div { ...rest } className={ this.classNames('DataGrid', className) }>
            {
              this.renderConditional(
                props.search !== false,
                () => React.isValidElement(props.search) ? props.search : (
                  <DataGridView.Search { ...(props.search === true ? {} : props.search) } grid={ this.state } viewType={ viewType } />
                ),
              )
            }
            { grid }
            {
              this.renderConditional(
                props.pager !== false,
                () => React.isValidElement(props.pager) ? props.pager : (
                  <DataGridView.Pager { ...(props.pager === true ? {} : props.pager) } grid={ this.state } viewType={ viewType } />
                ),
              )
            }
          </div>
        ),
      );
    });
  }
}
