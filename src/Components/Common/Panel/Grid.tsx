import * as React from 'react';
import { Iterable } from 'ix';

import * as Layout from './GridLayout';
import { PanelItemContext, PanelItemProp, PanelItemProps, PanelTemplateProps, PanelItemTemplate, PanelProps, Panel } from './Panel';

export { RowDefinition, ColumnDefinition } from './GridLayout';

export interface GridRenderProps {
  /**
   * true to display a border around grid cells
   */
  border?: boolean;
}

export interface GridProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends PanelProps<T, TContext>, GridRenderProps {
}

export interface GridComponentProps extends React.HTMLProps<any>, GridProps {
}

export class Grid extends Panel<GridComponentProps> {
  public static displayName = 'Grid';

  /**
   * Use this component to define your Row collection
   * i.e., <Grid.Rows><RowDefinition /></Grid.Rows>
   */
  public static Rows = Layout.GridRowDefinitions;

  /**
   * Use this component to define your Column collection
   * i.e., <Grid.Columns><ColumnDefinition /></Grid.Columns>
   */
  public static Columns = Layout.GridColumnDefinitions;

  render() {
    const { border, ...rest } = this.props;

    const bordered = { 'Grid-Border': border === true };
    const compact = { 'compact': this.props.compact };

    return this.renderPanel(this.wxr.classNames('Grid', bordered, compact), rest);
  }

  renderItems(allChildren?: React.ReactNode, componentClass?: React.ReactType) {
    const { children, rows, cols } = this.getLayout();

    return Iterable
      .range(0, rows.length)
      .map(row => {
        const colItems = Iterable
          .range(0, cols.length)
          .map(col => {
            return this.renderColumn(row, col, rows, cols, children);
          })
          .toArray();

        return this.renderRow(row, rows, colItems);
      })
      .defaultIfEmpty(this.renderEmpty())
      .toArray();
  }

  protected renderRow(row: number, rows: Array<Layout.GridLayoutDefinition>, colItems: React.ReactNode) {
    const def = rows[row];

    const t = def.itemTemplate;

    const context = { row, index: row };
    const itemClassName = Panel.getPanelItemPropValue(def.itemClassName, context);
    const itemStyle = Panel.getPanelItemPropValue(def.itemStyle, context);
    const itemProps = Panel.getPanelItemPropValue(def.itemProps, context) || {};
    const compact = { 'compact': this.props.compact };
    const itemTemplate = def.itemTemplate;

    const layoutStyle = Object.assign({}, itemStyle, {
      height: this.getCellLayoutValue(def),
    });

    const fragment = (
      <div className={ this.wxr.classNames('Grid-Row', compact, itemClassName) } style={ layoutStyle } data-grid-row={ row } key={ Layout.GridLayoutDefinition.generateKey(row) } { ...itemProps }>
        { colItems }
      </div>
    );

    if (itemTemplate == null) {
      return fragment;
    }

    return itemTemplate(fragment, context);
  }

  protected renderColumn(row: number, column: number, rows: Array<Layout.GridLayoutDefinition>, cols: Array<Layout.GridLayoutDefinition>, children: Array<React.ReactChild>) {
    const def = cols[column];
    const cellItems: Array<React.ReactChild> = [];

    let index = 0;
    while (index < children.length) {
      const child: any = children[index];
      const childProps = child != null && child.props != null ? child.props : undefined;
      const desiredRow = (childProps == null ? undefined : childProps['data-grid-row']) || 0;
      const desiredCol = (childProps == null ? undefined : childProps['data-grid-column']) || 0;
      if (desiredRow === row && desiredCol === column) {
        const cellItem = React.isValidElement<any>(child) ?
          React.cloneElement(child, { 'data-grid-row': undefined, 'data-grid-column': undefined }) :
          child;
        cellItems.push(cellItem);
        children.splice(index, 1);
      }
      else {
        ++index;
      }
    }

    const context = { row, column, index };
    const itemClassName = Panel.getPanelItemPropValue(def.itemClassName, context);
    const itemStyle = Panel.getPanelItemPropValue(def.itemStyle, context);
    const itemProps = Panel.getPanelItemPropValue(def.itemProps, context) || {};
    const compact = { 'compact': this.props.compact };
    const itemTemplate = def.itemTemplate;

    const layoutStyle = Object.assign({}, itemStyle, {
      width: this.getCellLayoutValue(def),
    });

    const fragment = (
      <div className={ this.wxr.classNames('Grid-Column', compact, itemClassName) } style={ layoutStyle } data-grid-column={ column } key={ Layout.GridLayoutDefinition.generateKey(row, column) } { ...itemProps }>
        { super.renderItems(cellItems) }
      </div>
    );

    if (itemTemplate == null) {
      return fragment;
    }

    return itemTemplate(fragment, context);
  }

  protected getCellLayoutValue(def: Layout.GridLayoutDefinition) {
    return def.stretch ? `${ (def.amount || 1) * 100 }%` : def.amount;
  }

  protected getLayout() {
    const children = React.Children.toArray(this.props.children);
    let rows: React.ReactElement<Layout.GridRowDefinitionsProps> | undefined;
    let cols: React.ReactElement<Layout.GridColumnDefinitionsProps> | undefined;

    let index = 0;
    while (index < children.length) {
      const elem: any = children[index];

      if (React.isType(elem, Layout.GridRowDefinitions)) {
        rows = elem;
        children.splice(index, 1);
      }
      else if (React.isType(elem, Layout.GridColumnDefinitions)) {
        cols = elem;
        children.splice(index, 1);
      }
      else {
        ++index;
      }

      if (rows != null && cols != null) {
        break;
      }
    }

    return {
      children,
      rows: this.getLayoutDefinitions(rows),
      cols: this.getLayoutDefinitions(cols),
    };
  }

  protected getLayoutDefinitions(elem: Layout.GridLayoutDefinitionGroupElement | undefined) {
    if (elem == null) {
      return [ new Layout.GridLayoutDefinition() ];
    }

    return React.Children.map(
      elem.props.children,
      (x: Layout.GridLayoutDefinitionElement) => {
        return new Layout.GridLayoutDefinition(x, elem);
      });
  }
}
