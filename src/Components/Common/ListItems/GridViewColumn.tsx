import * as React from 'react';

import { PanelFragment } from '../Panel/Panel';
import { ContentTooltip } from '../ContentTooltip/ContentTooltip';

export interface GridViewColumnProps {
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the GridView
   */
  item?: {};
  field?: string;
  header?: PanelFragment;
  headerTemplate?: (header: PanelFragment | undefined) => PanelFragment;
  headerTooltipTemplate?: PanelFragment | ((column: GridViewColumn, content: PanelFragment) => PanelFragment | undefined);
  cellTemplate?: (item: {}, field: string | undefined) => PanelFragment;
  cellTooltipTemplate?: (item: {}, field: string | undefined, content: PanelFragment) => PanelFragment | undefined;
  itemTemplate?: (fragment: PanelFragment, item: {} | undefined, field: string | undefined) => PanelFragment;
  id?: string;
  width?: number | string;
}

export interface GridViewColumnComponentProps extends GridViewColumnProps {
}

export class GridViewColumn extends React.Component<GridViewColumnComponentProps> {
  public static displayName = 'GridViewColumn';

  public static canRenderHeader(column: React.ReactChild) {
    return (
      React.isValidType(column, GridViewColumn) &&
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

  protected renderContent(type: 'header' | 'cell', content: PanelFragment | undefined, item: {} | undefined, field: string | undefined) {
    const fragment = (
      <div className={ `GridViewColumn-${ type }Content` }>
        { GridViewColumn.sanitizeFragment(content) }
      </div>
    );

    if (this.props.itemTemplate == null) {
      return fragment;
    }

    return this.props.itemTemplate(fragment, item, field);
  }

  protected renderHeader() {
    const template = this.props.headerTemplate || ((header: PanelFragment | undefined) => header);
    const headerOrField = this.props.header || this.props.field;

    const content = (headerOrField == null && this.props.headerTemplate == null) ?
      undefined :
      template(headerOrField);

    const headerContent = this.renderContent('header', content, undefined, this.props.field);
    const tooltipContent = this.renderHeaderTooltip(headerContent);

    return (
      <th style={ ({ width: this.props.width }) }>
        { this.renderTooltip(tooltipContent, headerContent) }
      </th>
    );
  }

  protected renderHeaderTooltip(context: PanelFragment) {
    if (this.props.headerTooltipTemplate instanceof Function) {
      return this.props.headerTooltipTemplate(this, context);
    }

    return this.props.headerTooltipTemplate;
  }

  protected renderCell() {
    const template = this.props.cellTemplate ||
      ((item: {}, field: string | undefined) => GridViewColumn.renderItemField(item, field));

    const content = template(this.props.item!, this.props.field);
    const cellContent = this.renderContent('cell', content, this.props.item, this.props.field);

    const tooltipContent = this.renderCellTooltip(cellContent);

    return (
      <td style={ ({ width: this.props.width }) }>
        { this.renderTooltip(tooltipContent, cellContent) }
      </td>
    );
  }

  protected renderCellTooltip(context: PanelFragment) {
    if (this.props.cellTooltipTemplate == null) {
      return undefined;
    }

    return this.props.cellTooltipTemplate(this.props.item!, this.props.field, context);
  }

  protected renderTooltip(content: PanelFragment | undefined, context: PanelFragment) {
    if (content == null) {
      return context;
    }

    const id = this.props.id || this.props.field;

    if (React.isValidType<any>(content, ContentTooltip)) {
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
