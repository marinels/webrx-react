import * as React from 'react';

import { PanelFragment } from '../Panel/Panel';
import { ContentTooltip } from '../ContentTooltip/ContentTooltip';
import { NavButton } from '../NavButton/NavButton';

export class GridViewColumns extends React.Component {
  render() {
    return this.props.children;
  }
}

export interface GridViewColumnProps {
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the GridView
   */
  item?: {};
  field?: string;
  header?: PanelFragment;
  headerTemplate?: (header: PanelFragment) => PanelFragment;
  headerTooltipTemplate?: PanelFragment | ((column: GridViewColumn, content: PanelFragment) => PanelFragment);
  headerStyle?: React.CSSProperties;
  headerProps?: {};
  cellTemplate?: (item: {}, field: string | undefined) => PanelFragment;
  cellTooltipTemplate?: (item: {}, field: string | undefined, content: PanelFragment) => PanelFragment;
  cellStyle?: React.CSSProperties;
  cellProps?: {};
  itemTemplate?: (fragment: PanelFragment, item: {} | undefined, field: string | undefined) => PanelFragment;
  id?: string;
  className?: string;
  width?: number | string;
}

export interface GridViewColumnComponentProps extends GridViewColumnProps {
}

export class GridViewColumn<T extends GridViewColumnProps = GridViewColumnComponentProps> extends React.Component<T> {
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

  public static renderItemField(item: StringMap<any>, field: string | undefined): PanelFragment {
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

  protected renderContent(type: 'header' | 'cell', content: PanelFragment, item: {} | undefined, field: string | undefined) {
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

  protected renderHeader(headerTemplate?: (header: PanelFragment) => PanelFragment) {
    headerTemplate = headerTemplate || this.props.headerTemplate;

    const template = headerTemplate || (x => x);
    const headerOrField: PanelFragment = this.props.header || this.props.field;

    const content = (headerOrField == null && this.props.headerTemplate == null) ?
      undefined :
      template(headerOrField);

    const headerContent = this.renderContent('header', content, undefined, this.props.field);
    const tooltipContent = this.renderHeaderTooltip(headerContent);

    const style = Object.assign(
      { width: this.props.width },
      this.props.headerStyle,
    );

    const props = Object.assign(
      { style },
      this.props.headerProps,
    );

    return (
      <th className={ this.props.className } { ...props }>
        { this.renderTooltip(tooltipContent, headerContent) }
      </th>
    );
  }

  protected renderHeaderTooltip(context: PanelFragment): PanelFragment {
    if (this.props.headerTooltipTemplate == null) {
      return undefined;
    }

    if (this.props.headerTooltipTemplate instanceof Function) {
      return this.props.headerTooltipTemplate(this, context);
    }

    return this.props.headerTooltipTemplate;
  }

  protected renderCell(cellTemplate?: (item: {}, field: string | undefined) => PanelFragment) {
    cellTemplate = cellTemplate || this.props.cellTemplate;

    const template = cellTemplate || ((x, f) => GridViewColumn.renderItemField(x, f));

    const content = template(this.props.item!, this.props.field);
    const cellContent = this.renderContent('cell', content, this.props.item, this.props.field);

    const tooltipContent = this.renderCellTooltip(cellContent);

    const style = Object.assign(
      { width: this.props.width },
      this.props.cellStyle,
    );

    const props = Object.assign(
      { style },
      this.props.cellProps,
    );

    return (
      <td className={ this.props.className } { ...props }>
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

  protected renderTooltip(content: PanelFragment, context: PanelFragment) {
    if (content == null) {
      return context;
    }

    const id = this.props.id || this.props.field;

    if (React.isValidType<any>(content, ContentTooltip)) {
      const child = (
        content.props.context == null &&
        React.Children.count(content.props.children) === 0
      ) ? context : undefined;
      return React.cloneElement(content, { id, className: this.props.className, ...content.props }, child);
    }

    return (
      <ContentTooltip id={ id } className={ this.props.className } content={ content }>
        { context }
      </ContentTooltip>
    );
  }
}

export interface NavButtonColumnProps extends GridViewColumnProps {
  href: string | undefined | ((item: {}, field: string | undefined) => (string | undefined));
}

export interface NavButtonColumnComponentProps extends NavButtonColumnProps {
}

export class NavButtonColumn extends GridViewColumn<NavButtonColumnComponentProps> {
  static defaultProps: Partial<NavButtonColumnProps> = {
    className: 'NavButtonColumn',
  };

  renderCell() {
    return super.renderCell(this.renderNavButton.bind(this));
  }

  protected renderNavButton(item: {}, field: string | undefined): PanelFragment {
    const href = this.props.href instanceof Function ?
      this.props.href(item, field) :
      this.props.href;

    return (
      <NavButton href={ href } compact />
    );
  }
}
