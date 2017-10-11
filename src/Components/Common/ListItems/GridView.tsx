import * as React from 'react';
import { Iterable } from 'ix';
import * as classNames from 'classnames';
import { Table } from 'react-bootstrap';

import { Logging } from '../../../Utils';
import { ItemsView } from '../Items/ItemsView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { PanelFragment } from '../Panel/Panel';
import { TablePanel } from '../Panel/TablePanel';
import { ContentTooltip } from '../ContentTooltip/ContentTooltip';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface GridViewColumnProps {
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the GridView
   */
  item?: {};
  field?: string;
  header?: PanelFragment;
  headerTemplate?: (header: PanelFragment | undefined) => PanelFragment;
  headerTooltipTemplate?: PanelFragment | ((column: GridViewColumn, content: React.ReactElement<any>) => PanelFragment | undefined);
  cellTemplate?: (item: {}, field: string | undefined) => PanelFragment;
  cellTooltipTemplate?: (item: {}, field: string | undefined, content: React.ReactElement<any>) => PanelFragment | undefined;
  id?: string;
  width?: number | string;
}

export class GridViewColumn extends React.Component<GridViewColumnProps> {
  public static displayName = 'GridViewColumn';

  static defaultProps = {
    width: 1,
  };

  public static canRenderHeader(column: React.ReactChild) {
    return (
      React.isValidElement<GridViewColumnProps>(column) &&
      column.type === GridViewColumn &&
      (column.props.header != null || column.props.field != null)
    );
  }

  public static sanitizeFragment(content?: PanelFragment) {
    if (content == null) {
      return (
        <span>&nbsp;</span>
      );
    }

    return content;
  }

  public static renderItemField(item: StringMap<any>, field: string | undefined): PanelFragment | undefined {
    if (String.isNullOrEmpty(field)) {
      return undefined;
    }

    return item[field];
  }

  render() {
    const col = this.props.item == null ?
      this.renderHeader() :
      this.renderCell();

    return (col == null || React.isValidElement(col)) ? col : (<div>{ col || null }</div>);
  }

  protected renderHeader() {
    const template = this.props.headerTemplate || ((header: PanelFragment | undefined) => header);
    const headerOrField = this.props.header || this.props.field;

    const content = (headerOrField == null && this.props.headerTemplate == null) ?
      undefined :
      template(headerOrField);

    const headerContent = (
      <div className='GridViewColumn-headerContent'>
        { GridViewColumn.sanitizeFragment(content) }
      </div>
    );

    const tooltipContent = this.renderHeaderTooltip(headerContent);

    return (
      <th style={ ({ width: this.props.width }) }>
        { this.renderTooltip(tooltipContent, headerContent) }
      </th>
    );
  }

  protected renderHeaderTooltip(context: React.ReactElement<any>) {
    if (this.props.headerTooltipTemplate instanceof Function) {
      return this.props.headerTooltipTemplate(this, context);
    }

    return this.props.headerTooltipTemplate;
  }

  protected renderCell() {
    const template = this.props.cellTemplate ||
      ((item: {}, field: string | undefined) => GridViewColumn.renderItemField(item, field));

    const content = template(this.props.item!, this.props.field);

    const cellContent = (
      <div className='GridViewColumn-cellContent'>
        { GridViewColumn.sanitizeFragment(content) }
      </div>
    );

    const tooltipContent = this.renderCellTooltip(cellContent);

    return (
      <td style={ ({ width: this.props.width }) }>
        { this.renderTooltip(tooltipContent, cellContent) }
      </td>
    );
  }

  protected renderCellTooltip(context: React.ReactElement<any>) {
    if (this.props.cellTooltipTemplate == null) {
      return undefined;
    }

    return this.props.cellTooltipTemplate(this.props.item!, this.props.field, context);
  }

  protected renderTooltip(content: PanelFragment | undefined, context: React.ReactElement<any>) {
    if (content == null) {
      return context;
    }

    const id = this.props.id || this.props.field;

    if (React.isValidElement<any>(content) && content.type === ContentTooltip) {
      const child = (
        content.props.context == null &&
        React.Children.count(content.props.children) === 0
      ) ? context : undefined;
      return React.cloneElement(content, { id, ...content.props }, child);
    }

    return (
      <ContentTooltip id={ id } content={ content }>
        { context }
      </ContentTooltip>
    );
  }
}

export interface GridViewProps extends ListItemsViewTemplateProps {
  fill?: boolean;
}

export class GridView extends ListItemsViewTemplate<GridViewProps> {
  public static displayName = 'GridView';

  private readonly logger: Logging.Logger = Logging.getLogger(GridView.displayName);

  render() {
    const { className, rest } = this.restProps(x => {
      const { fill, listItems, itemsProps } = x;
      return { fill, listItems, itemsProps };
    });

    const props = this.getItemsProps();

    props.itemsPanelTemplate = props.itemsPanelTemplate || this.renderTablePanel.bind(this);
    props.itemTemplate = props.itemTemplate || this.renderTableRow.bind(this);

    return (
      <ItemsView
        className={ classNames('Grid', className) }
        viewModel={ this.getListItems() }
        { ...props }
        { ...React.Component.trimProps(rest) }
      />
    );
  }

  protected renderTablePanel(itemTemplates: Array<React.ReactNode>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) {
    return (
      <TablePanel header={ this.renderTableHeaderRow() }>
        { itemTemplates }
      </TablePanel>
    );
  }

  protected getColumnDefinitions(): Array<React.ReactChild> | undefined {
    if (React.Children.count(this.props.children) === 0) {
      // try and auto-gen columns
      const item = this.getListItems().getItems().first();

      if (item == null) {
        this.logger.warn('Unable to Autogenerate Columns');

        return undefined;
      }

      return Iterable
        .from(Object.keys(item))
        .orderBy(x => x)
        .map(x => (
          <GridViewColumn key={ x } field={ x } />
        ))
        .toArray();
    }

    return React.Children.toArray(this.props.children);
  }

  protected renderTableHeaderRow() {
    const columns = this.getColumnDefinitions();

    if (columns == null) {
      return undefined;
    }

    const renderHeaders = Iterable
      .from(columns)
      .some(x => GridViewColumn.canRenderHeader(x));

    if (renderHeaders) {
      return (
        <tr>
          { columns }
        </tr>
      );
    }

    return undefined;
  }

  protected renderTableRow(item: {}, index: number) {
    const columns = this.getColumnDefinitions();

    return columns == null ? undefined : this.renderListItem(
      <tr>
        {
          columns
            .map(x => {
              if (React.isValidElement(x)) {
                return React.cloneElement<GridViewColumnProps, any>(x, { item });
              }

              this.logger.warn('Invalid Column', x);
              return '';
            })
        }
      </tr>,
      item,
      (isSelected, elem) => {
        return {
          className: classNames({ 'Selected': isSelected }, elem.props.className),
        };
      },
    );
  }
}
