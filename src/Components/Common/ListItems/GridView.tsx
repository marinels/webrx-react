import * as React from 'react';
import { Iterable } from 'ix';
import * as classNames from 'classnames';
import { Table } from 'react-bootstrap';

import { Logging } from '../../../Utils';
import { PanelView } from './PanelView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { GridViewColumns, GridViewColumnProps, GridViewColumn } from './GridViewColumn';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';
import { TablePanel, BootstrapTableProps } from '../Panel/TablePanel';
import { ContentTooltip } from '../ContentTooltip/ContentTooltip';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface GridTemplateProps<T = {}> {
  headerTemplate?: (header: PanelFragment, item: T | undefined, field: string | undefined) => PanelFragment;
  cellTemplate?: (cell: PanelFragment, item: T | undefined, field: string | undefined) => PanelFragment;
}

export interface GridTableRenderProps extends BootstrapTableProps {
  fixedLayout?: boolean;
}

export interface GridViewProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends GridTemplateProps<T>, ListItemsViewTemplateProps<T, TContext>, GridTableRenderProps {
}

export interface GridViewComponentProps extends React.HTMLProps<any>, GridViewProps {
}

export class GridView extends ListItemsViewTemplate<GridViewProps> {
  public static displayName = 'GridView';

  public static readonly Columns = GridViewColumns;

  private readonly logger: Logging.Logger = Logging.getLogger(GridView.displayName);
  private columns: Array<React.ReactChild> | undefined;

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { headerTemplate, cellTemplate, bordered, condensed, hover, responsive, striped, bsClass, fixedLayout, listItems, itemsProps } = x;
      return { headerTemplate, cellTemplate, bordered, condensed, hover, responsive, striped, bsClass, fixedLayout, listItems, itemsProps };
    });

    this.columns = this.getColumnDefinitions();

    if (this.columns == null) {
      return null;
    }

    const gridProps = this.getItemsProps();

    gridProps.itemsPanelTemplate = gridProps.itemsPanelTemplate || this.renderTablePanel.bind(this);
    gridProps.itemTemplate = gridProps.itemTemplate || this.renderTableRow.bind(this);

    return (
      <PanelView
        className={ classNames('Grid', className) }
        itemsPanelTemplate={ this.renderTablePanel.bind(this) }
        listItems={ props.listItems }
        itemsProps={ gridProps }
        { ...this.trimProps(rest) }
      >
        { children }
      </PanelView>
    );
  }

  protected renderTablePanel(itemTemplates: Array<React.ReactNode>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) {
    const { props } = this.restProps(x => {
      const { bordered, condensed, hover, responsive, striped, bsClass, fixedLayout } = x;
      return { bordered, condensed, hover, responsive, striped, bsClass, fixedLayout };
    });

    return (
      <TablePanel
        header={ this.renderTableHeaderRow() }
        { ...this.trimProps(props) }
      >
        { itemTemplates }
      </TablePanel>
    );
  }

  protected getColumnDefinitions(): Array<React.ReactChild> | undefined {
    const count = React.Children.count(this.props.children);

    if (count === 0) {
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

    if (count === 1) {
      const elem = React.Children.only(this.props.children);

      if (React.isType(elem, GridViewColumns)) {
        return React.Children.toArray(elem.props.children);
      }
    }

    return React.Children.toArray(this.props.children);
  }

  protected renderTableHeaderRow() {
    if (this.columns == null) {
      return undefined;
    }

    const renderHeaders = Iterable
      .from(this.columns)
      .some(x => GridViewColumn.canRenderHeader(x));

    if (renderHeaders) {
      const props = this.trimProps({
        itemTemplate: this.props.headerTemplate,
      });

      return (
        <tr>
          {
            this.columns
              .map(x => {
                if (React.isValidElement(x)) {
                  return (
                    <x.type key={ x.key } { ...x.props } { ...props } />
                  );
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
    const props = this.trimProps({
      item,
      itemTemplate: this.props.cellTemplate,
    });

    return columns == null ? undefined : this.renderListItem(
      <tr>
        {
          columns
            .map(x => {
              if (React.isValidElement(x)) {
                return (
                  <x.type key={ x.key } { ...x.props } { ...props } />
                );
              }

              return '';
            })
        }
      </tr>,
      item,
      PanelView.getSelectedProps,
    );
  }
}
