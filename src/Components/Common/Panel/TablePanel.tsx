import * as React from 'react';
import { Table, TableProps } from 'react-bootstrap';

import { PanelItemProps, PanelTemplateProps, Panel, PanelFragment } from './Panel';

export interface TablePanelProps extends PanelItemProps, PanelTemplateProps {
  header?: PanelFragment;
  bordered?: boolean;
  condensed?: boolean;
  hover?: boolean;
  responsive?: boolean;
  striped?: boolean;
  fill?: boolean;
  bsClass?: string;
}

export interface TablePanelComponentProps extends TableProps, TablePanelProps {
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
