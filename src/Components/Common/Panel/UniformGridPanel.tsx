import { Iterable } from 'ix';
import * as React from 'react';

import { GridRenderProps } from './Grid';
import { GridColumnContext, GridLayoutDefinition, GridRowContext } from './GridLayout';
import { Panel, PanelFragment, PanelItemContext, PanelItemProp, PanelProps } from './Panel';


export interface UniformRowItemProps<T = {}> {
  /**
   * apply custom row class name to the corresponding panel item
   */
  rowClassName?: PanelItemProp<string, GridRowContext>;

  /**
   * apply custom row style to the corresponding panel item
   */
  rowStyle?: PanelItemProp<React.CSSProperties, GridRowContext>;

  /**
   * apply custom row props to the corresponding panel item
   */
  rowProps?: PanelItemProp<T, GridRowContext>;
}

export interface UniformColumnItemProps<T = {}> {
  /**
   * apply custom column class name to the corresponding panel item
   */
  columnClassName?: PanelItemProp<string, GridColumnContext>;

  /**
   * apply custom column style to the corresponding panel item
   */
  columnStyle?: PanelItemProp<React.CSSProperties, GridColumnContext>;

  /**
   * apply custom column props to the corresponding panel item
   */
  columnProps?: PanelItemProp<T, GridColumnContext>;
}

export interface UniformGridPanelProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext,
> extends PanelProps<T, TContext>, UniformRowItemProps<T>, UniformColumnItemProps<T>, GridRenderProps {
  /**
   * number of columns in the grid
   */
  gridColumns: number;

  /**
   * number of rows in the grid
   */
  gridRows: number;

  /**
   * which column index to start rendering panel items within (in the first row)
   */
  firstColumn?: number;

  /**
   * True to render rows which have no corresponding panel items to render
   */
  renderEmptyRows?: boolean;

  /**
   * template to render an empty panel item cell
   * default template renders an &nbsp; block
   */
  emptyCellTemplate?: (row: number, column: number) => PanelFragment;
}

export interface UniformGridPanelComponentProps extends React.HTMLProps<any>, UniformGridPanelProps {
}

export class UniformGridPanel extends Panel<UniformGridPanelComponentProps> {
  public static displayName = 'UniformGridPanel';

  static defaultProps: Partial<UniformGridPanelProps> = {
    firstColumn: 0,
  };

  public static defaultEmptyTemplate(row: number, column: number): PanelFragment {
    return (
      <div key={ GridLayoutDefinition.generateKey(row, column) } className='Grid-Empty'>&nbsp;</div>
    );
  }

  render() {
    const {
      gridColumns, gridRows, firstColumn, border, renderEmptyRows, emptyCellTemplate, rowClassName, rowStyle, rowProps,
      columnClassName, columnStyle, columnProps, ...rest,
    } = this.props;

    const bordered = { 'Grid-Border': border === true };

    return this.renderPanel(this.wxr.classNames('Grid', 'Grid-Uniform', bordered), rest);
  }

  renderItems(children?: React.ReactNode, componentClass?: React.ReactType) {
    const itemTemplates = super.renderItems(children, componentClass);

    let index = 0 - this.props.firstColumn!;
    return Iterable
      .range(0, this.props.gridRows)
      .map(row => {
        if (this.props.renderEmptyRows !== true && index >= itemTemplates.length) {
          return undefined;
        }

        return Iterable
          .range(0, this.props.gridColumns)
          .map(column => {
            const isBeforeFirstItem = index < 0;
            const isAfterLastItem = index >= itemTemplates.length;

            const itemTemplate = (isBeforeFirstItem || isAfterLastItem) ?
              this.renderEmptyCell(row, column, index) :
              itemTemplates[index];

            const item = (itemTemplate != null && React.isValidElement<any>(itemTemplate)) ?
              React.cloneElement(itemTemplate, { key: GridLayoutDefinition.generateKey(row, column) }) :
              itemTemplate;

            const context = { row, column, index: index++ };
            const colClassName = Panel.getPanelItemPropValue(this.props.columnClassName, context);
            const colStyle = Panel.getPanelItemPropValue(this.props.columnStyle, context);
            const colProps = Panel.getPanelItemPropValue(this.props.columnProps, context) || {};

            return (
              <div key={ GridLayoutDefinition.generateKey(row, column) } style={ colStyle }
                className={ this.wxr.classNames('Grid-Column', colClassName) } { ...colProps }
              >
                { item }
              </div>
            );
          })
          .toArray();
      })
      .filterNull()
      .map((cols, row) => {
        const context = { row, index };
        const rowClassName = Panel.getPanelItemPropValue(this.props.rowClassName, context);
        const rowStyle = Panel.getPanelItemPropValue(this.props.rowStyle, context);
        const rowProps = Panel.getPanelItemPropValue(this.props.rowProps, context) || {};

        return (
          <div key={ GridLayoutDefinition.generateKey(row) } style={ rowStyle }
            className={ this.wxr.classNames('Grid-Row', rowClassName) } { ...rowProps }
          >
            { cols }
          </div>
        );
      })
      .toArray();
  }

  protected renderEmptyCell(row: number, column: number, index: number) {
    return this.renderItem(
      (this.props.emptyCellTemplate || UniformGridPanel.defaultEmptyTemplate)(row, column),
      index,
    );
  }
}
