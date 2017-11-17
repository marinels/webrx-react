import * as React from 'react';
import { Table, TableProps } from 'react-bootstrap';

import { PanelItemProps, PanelItemContext, PanelTemplateProps, Panel, PanelFragment } from './Panel';

// clone of react-bootstrap TableProps, but without the subclassing
export type BootstrapTableProps = Omit<TableProps, React.HTMLProps<Table>>;

export interface TablePanelProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends PanelItemProps<T, TContext>, PanelTemplateProps<TContext>, BootstrapTableProps {
  header?: PanelFragment;
}

export interface TablePanelComponentProps extends TablePanelProps, TableProps {
}

export class TablePanel extends Panel<TablePanelComponentProps> {
  public static displayName = 'TablePanel';

  static defaultProps = {
    bordered: true,
    hover: true,
    responsive: true,
    striped: true,
  };

  render() {
    const { header, ...rest } = this.props;

    return this.renderPanel('TablePanel', rest, Table);
  }

  renderItems(children?: React.ReactNode, componentClass?: React.ReactType) {
    const fragments: Array<PanelFragment> = [];
    const itemTemplates = super.renderItems(children, componentClass || '');

    if (this.props.header != null) {
      fragments.push(
        <thead key='thead'>
          { this.props.header }
        </thead>,
      );
    }

    fragments.push(
      <tbody key='tbody'>
        { itemTemplates }
      </tbody>,
    );

    return fragments;
  }
}
