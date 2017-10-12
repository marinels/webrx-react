import * as React from 'react';
import { Iterable } from 'ix';
import * as classNames from 'classnames';
import { Table } from 'react-bootstrap';

import { Logging } from '../../../Utils';
import { ItemsView } from '../Items/ItemsView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { GridViewColumnProps, GridViewColumn } from './GridViewColumn';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { PanelFragment } from '../Panel/Panel';
import { TablePanel } from '../Panel/TablePanel';
import { ContentTooltip } from '../ContentTooltip/ContentTooltip';
import { ListItemsViewModel } from './ListItemsViewModel';

export { GridViewColumnProps, GridViewColumn };

export interface GridTemplateProps {
  headerTemplate?: (header: PanelFragment, item: {} | undefined, field: string | undefined) => PanelFragment;
  cellTemplate?: (cell: PanelFragment, item: {} | undefined, field: string | undefined) => PanelFragment;
}

export interface GridFacadeProps extends GridTemplateProps, ListItemsViewTemplateProps {
  fill?: boolean;
}

export class GridView extends ListItemsViewTemplate<GridFacadeProps> {
  public static displayName = 'GridView';

  private readonly logger: Logging.Logger = Logging.getLogger(GridView.displayName);

  render() {
    const { className, rest } = this.restProps(x => {
      const { fill, headerTemplate, cellTemplate, listItems, itemsProps } = x;
      return { fill, headerTemplate, cellTemplate, listItems, itemsProps };
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
      const props = React.Component.trimProps({
        itemTemplate: this.props.headerTemplate,
      });

      return (
        <tr>
          {
            columns
              .map(x => {
                if (React.isValidElement(x)) {
                  return React.cloneElement<GridViewColumnProps, any>(x, props);
                }

                return '';
              })
          }
        </tr>
      );
    }

    return undefined;
  }

  protected renderTableRow(item: {}, index: number) {
    const columns = this.getColumnDefinitions();
    const props = React.Component.trimProps({
      item,
      itemTemplate: this.props.cellTemplate,
    });

    return columns == null ? undefined : this.renderListItem(
      <tr>
        {
          columns
            .map(x => {
              if (React.isValidElement(x)) {
                return React.cloneElement<GridViewColumnProps, any>(x, props);
              }

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
