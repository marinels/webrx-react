import * as React from 'react';
import * as classNames from 'classnames';

import { BaseView, BaseViewProps } from '../../React';
import { ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { ItemsProps } from '../Items/ItemsView';
import { ListGroupView } from './ListGroupView';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListItemsProps extends ItemsProps  {
  view?: React.ReactElement<ListItemsViewTemplateProps>;
  children?: React.ReactNode;
}

export interface ListItemsViewProps extends BaseViewProps<ListItemsViewModel<{}>, ListItemsView>, ListItemsProps {
}

export class ListItemsView extends BaseView<ListItemsViewProps, ListItemsViewModel<{}>> {
  public static renderDefaultListItemsView() {
    return (
      <ListGroupView />
    );
  }

  public static getListItemsView<T extends ListItemsProps>(
    props: T,
    defaultListItemsView: (props: T) => React.ReactElement<ListItemsViewTemplateProps>,
  ): React.ReactElement<ListItemsViewTemplateProps> {
    if (props.view != null) {
      return props.view;
    }

    if (React.Children.count(props.children) === 1) {
      return React.Children.only(props.children);
    }

    return defaultListItemsView(props);
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { view } = x;
      return { view };
    });

    const listItemsView = ListItemsView.getListItemsView(this.props, ListItemsView.renderDefaultListItemsView);

    const viewProps: ListItemsViewTemplateProps = {
      itemsProps: React.Component.trimProps(Object.assign({}, listItemsView.props.itemsProps, rest)),
      listItems: this.viewModel,
      className: classNames('ListItems', className, listItemsView.props.className),
    };

    return React.cloneElement(listItemsView, viewProps);
  }
}
