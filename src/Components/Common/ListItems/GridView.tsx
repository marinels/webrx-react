import * as React from 'react';
import * as classNames from 'classnames';
import { Table } from 'react-bootstrap';

import { Logging } from '../../../Utils';
import { ItemsView } from '../Items/ItemsView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { PanelFragment } from '../Panel/Panel';
import { TablePanel } from '../Panel/TablePanel';
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
  cellTemplate?: (item: {}, field: string | undefined) => PanelFragment;
  width?: number | string;
}

export class GridViewColumn extends React.Component<GridViewColumnProps> {
  public static displayName = 'GridViewColumn';

  static defaultProps = {
    width: 1,
  };

  public static renderItemField(item: StringMap<any>, field: string | undefined): PanelFragment {
    if (String.isNullOrEmpty(field)) {
      return '';
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

    return (headerOrField == null && this.props.headerTemplate == null) ?
      null :
      (
        <th style={ ({ width: this.props.width }) }>
          { template(headerOrField) }
        </th>
      );
  }

  protected renderCell() {
    const template = this.props.cellTemplate ||
      ((item: {}, field: string | undefined) => GridViewColumn.renderItemField(item, field));

    return (
      <td style={ ({ width: this.props.width }) }>
        { template(this.props.item!, this.props.field) }
      </td>
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
      const { fill, listItems, itemsRenderProps } = x;
      return { fill, listItems, itemsRenderProps };
    });

    return (
      <ItemsView
        className={ className }
        viewModel={ this.getListItems() }
        itemsPanelTemplate={ this.renderTablePanel.bind(this) }
        itemTemplate={ this.renderTableRow.bind(this) }
        { ...this.getItemsRenderProps() }
        { ...rest }
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

      return Object.keys(item)
        .map(x => (
          <GridViewColumn key={ x } field={ x } />
        ));
    }

    return React.Children.toArray(this.props.children);
  }

  protected renderTableHeaderRow() {
    const columns = this.getColumnDefinitions();

    return columns == null ? undefined : (
      <tr>
        { columns }
      </tr>
    );
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
        {
          React.Children.map(this.props.children, (col: React.ReactElement<GridViewColumnProps>) => {
            return React.cloneElement<GridViewColumnProps, any>(col, { item });
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
