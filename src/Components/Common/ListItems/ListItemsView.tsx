import * as React from 'react';
import * as classNames from 'classnames';

import { BaseView, BaseViewProps } from '../../React';
import { ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { ItemsProps } from '../Items/ItemsView';
import { ListGroupView } from './ListGroupView';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListItemsProps extends ItemsProps  {
  view?: React.ReactElement<ListItemsViewTemplateProps>;
}

export interface ListItemsViewProps extends BaseViewProps<ListItemsViewModel<{}>, ListItemsView>, ListItemsProps {
}

export class ListItemsView extends BaseView<ListItemsViewProps, ListItemsViewModel<{}>> {
  static defaultProps = {
    view: (<ListGroupView />),
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { view } = x;
      return { view };
    });

    if (props.view == null) {
      return null;
    }

    const viewProps: ListItemsViewTemplateProps = {
      itemsProps: React.Component.trimProps(Object.assign({}, props.view.props.itemsProps, rest)),
      listItems: this.viewModel,
      className: classNames('ListItems', className, props.view.props.className),
    };

    return React.cloneElement(props.view, viewProps);
  }
}
