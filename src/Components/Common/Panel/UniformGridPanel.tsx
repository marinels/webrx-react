import * as React from 'react';
import { Iterable } from 'ix';

import { wxr } from '../../React';
import { PanelProps, Panel } from './Panel';

export interface UniformGridPanelProps extends PanelProps {
  columns: number;
  rows: number;
  firstColumn?: number;
  border?: boolean;
  renderEmptyRows?: boolean;
  emptyTemplate?: () => React.ReactNode;
}

export class UniformGridPanel extends Panel<UniformGridPanelProps> {
  public static displayName = 'UniformGridPanel';

  static defaultProps = {
    firstColumn: 0,
  };

  public static defaultEmptyTemplate() {
    return (
      <div className='Grid-Empty'>&nbsp;</div>
    );
  }

  render() {
    const { columns, rows, firstColumn, border, renderEmptyRows, emptyTemplate, ...rest } = this.props;

    const bordered = { 'Grid-Border': border === true };

    return this.renderPanel(wxr.classNames('Grid', 'Grid-Uniform', bordered), rest);
  }

  renderItems() {
    const Component = this.props.componentClass || Panel.defaultComponentClass;

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
          .map(col => {
            const isBeforeFirstItem = row === 0 && col < this.props.firstColumn!;
            const isAfterLastItem = index >= itemTemplates.length;

            const itemTemplate = (isBeforeFirstItem || isAfterLastItem) ?
              this.renderEmpty() :
              itemTemplates[index];

            const item = (itemTemplate != null && React.isValidElement(itemTemplate)) ?
              React.cloneElement<any, any>(itemTemplate, { key: `${ row }.${ col }` }) :
              itemTemplate;

            if (isBeforeFirstItem === false && isAfterLastItem === false) {
              index = index + 1;
            }

            return (
              <div className='Grid-Column'>{ item }</div>
            );
          })
          .toArray();
      })
      .filterNull()
      .map((cols, i) => {
        return (
          <div key={ i } className='Grid-Row'>
            { cols }
          </div>
        );
      })
      .toArray();
  }

  protected renderEmpty() {
    return (this.props.emptyTemplate || UniformGridPanel.defaultEmptyTemplate)();
  }
}
