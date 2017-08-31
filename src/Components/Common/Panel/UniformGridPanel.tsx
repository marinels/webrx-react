import * as React from 'react';
import { Iterable } from 'ix';

import { wxr } from '../../React';
import { PanelProps, Panel, PanelItemProp } from './Panel';
import { GridRowContext, GridColumnContext } from './Grid';

export interface UniformRowItemProps {
  rowClassName?: PanelItemProp<string, GridRowContext>;
  rowStyle?: PanelItemProp<React.CSSProperties, GridRowContext>;
}

export interface UniformColumnItemProps {
  columnClassName?: PanelItemProp<string, GridColumnContext>;
  columnStyle?: PanelItemProp<React.CSSProperties, GridColumnContext>;
}

export interface UniformGridPanelProps extends React.HTMLAttributes<UniformGridPanelProps>, PanelProps, UniformRowItemProps, UniformColumnItemProps {
  columns: number;
  rows: number;
  firstColumn?: number;
  border?: boolean;
  renderEmptyRows?: boolean;
  emptyTemplate?: (row: number, column: number) => React.ReactNode;
}

export class UniformGridPanel extends Panel<UniformGridPanelProps> {
  public static displayName = 'UniformGridPanel';

  static defaultProps = {
    firstColumn: 0,
  };

  public static generateKey(row: number, column: number) {
    return `${ row }.${ column }`;
  }

  public static defaultEmptyTemplate(row: number, column: number) {
    return (
      <div key={ UniformGridPanel.generateKey(row, column) } className='Grid-Empty'>&nbsp;</div>
    );
  }

  render() {
    const { columns, rows, firstColumn, border, renderEmptyRows, emptyTemplate, ...rest } = this.props;

    const bordered = { 'Grid-Border': border === true };

    return this.renderPanel(wxr.classNames('Grid', 'Grid-Uniform', bordered), rest);
  }

  renderItems() {
    const component = this.props.componentClass || Panel.defaultComponentClass;

    const itemTemplates = super.renderItems();

    let index = 0;
    return Iterable
      .range(0, this.props.rows)
      .map(row => {
        if (this.props.renderEmptyRows !== true && index >= itemTemplates.length) {
          return undefined;
        }

        return Iterable
          .range(0, this.props.columns)
          .map(column => {
            const isBeforeFirstItem = row === 0 && column < this.props.firstColumn!;
            const isAfterLastItem = index >= itemTemplates.length;

            const itemTemplate = (isBeforeFirstItem || isAfterLastItem) ?
              this.renderEmpty(row, column, index, component) :
              itemTemplates[index];

            const item = (itemTemplate != null && React.isValidElement(itemTemplate)) ?
              React.cloneElement<any, any>(itemTemplate, { key: UniformGridPanel.generateKey(row, column) }) :
              itemTemplate;

            const colClassName = Panel.getPanelItemPropValue(this.props.columnClassName, { row, column, index: row });
            const colStyle = Panel.getPanelItemPropValue(this.props.columnStyle, { row, column, index: row });

            if (isBeforeFirstItem === false) {
              index = index + 1;
            }

            return (
              <div key={ UniformGridPanel.generateKey(row, column) } className={ wxr.classNames('Grid-Column', colClassName) } style={ colStyle }>
                { item }
              </div>
            );
          })
          .toArray();
      })
      .filterNull()
      .map((cols, row) => {
        const rowClassName = Panel.getPanelItemPropValue(this.props.rowClassName, { row, index: row });
        const rowStyle = Panel.getPanelItemPropValue(this.props.rowStyle, { row, index: row });

        return (
          <div key={ row } className={ wxr.classNames('Grid-Row', rowClassName) } style={ rowStyle }>
            { cols }
          </div>
        );
      })
      .toArray();
  }

  protected renderEmpty(row: number, column: number, index: number, component: React.ReactType) {
    return this.renderItem(
      (this.props.emptyTemplate || UniformGridPanel.defaultEmptyTemplate)(row, column),
      index,
      component,
    );
  }
}
