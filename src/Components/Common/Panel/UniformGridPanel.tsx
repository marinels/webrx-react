import * as React from 'react';
import { Iterable } from 'ix';

import { wxr } from '../../React';
import { PanelProps, Panel, PanelItemProp, PanelFragment } from './Panel';
import { GridRowContext, GridColumnContext, GridLayoutDefinition } from './GridLayout';
import { GridRenderProps } from './Grid';


export interface UniformRowItemProps {
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
  rowProps?: PanelItemProp<{}, GridRowContext>;
}

export interface UniformColumnItemProps {
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
  columnProps?: PanelItemProp<{}, GridColumnContext>;
}

export interface UniformGridPanelProps extends PanelProps, UniformRowItemProps, UniformColumnItemProps, GridRenderProps {
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
  emptyTemplate?: (row: number, column: number) => PanelFragment;
}

export interface UniformGridPanelComponentProps extends React.HTMLProps<UniformGridPanel>, UniformGridPanelProps {
}

export class UniformGridPanel extends Panel<UniformGridPanelComponentProps> {
  public static displayName = 'UniformGridPanel';

  static defaultProps = {
    firstColumn: 0,
  };

  public static defaultEmptyTemplate(row: number, column: number): PanelFragment {
    return (
      <div key={ GridLayoutDefinition.generateKey(row, column) } className='Grid-Empty'>&nbsp;</div>
    );
  }

  render() {
    const { gridColumns, gridRows, firstColumn, border, renderEmptyRows, emptyTemplate, rowClassName, rowStyle, rowProps, columnClassName, columnStyle, columnProps, ...rest } = this.props;

    const bordered = { 'Grid-Border': border === true };

    return this.renderPanel(wxr.classNames('Grid', 'Grid-Uniform', bordered), rest);
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
              this.renderEmpty(row, column, index) :
              itemTemplates[index];

            const item = (itemTemplate != null && React.isValidElement<any>(itemTemplate)) ?
              React.cloneElement(itemTemplate, { key: GridLayoutDefinition.generateKey(row, column) }) :
              itemTemplate;

            const context = { row, column, index: index++ };
            const colClassName = Panel.getPanelItemPropValue(this.props.columnClassName, context);
            const colStyle = Panel.getPanelItemPropValue(this.props.columnStyle, context);
            const colProps = Panel.getPanelItemPropValue(this.props.columnProps, context) || {};

            return (
              <div key={ GridLayoutDefinition.generateKey(row, column) } className={ wxr.classNames('Grid-Column', colClassName) } style={ colStyle } { ...colProps }>
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
          <div key={ GridLayoutDefinition.generateKey(row) } className={ wxr.classNames('Grid-Row', rowClassName) } style={ rowStyle } { ...rowProps }>
            { cols }
          </div>
        );
      })
      .toArray();
  }

  protected renderEmpty(row: number, column: number, index: number) {
    return this.renderItem(
      (this.props.emptyTemplate || UniformGridPanel.defaultEmptyTemplate)(row, column),
      index,
    );
  }
}
