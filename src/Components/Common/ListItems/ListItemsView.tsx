import * as classNames from 'classnames';
import * as React from 'react';

import { BaseView, BaseViewProps } from '../../React';
import { ItemsProps } from '../Items/ItemsView';
import { PanelItemContext } from '../Panel/Panel';
import { GridViewColumns } from './GridViewColumn';
import { ListGroupView } from './ListGroupView';
import { ListItemsViewModel } from './ListItemsViewModel';
import { ListItemsViewTemplateProps } from './ListItemsViewTemplate';

export interface ListItemsProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext
> extends ItemsProps<T, TContext> {
  view?: React.ReactElement<ListItemsViewTemplateProps<T, TContext>>;
  viewProps?: {};
  children?: React.ReactNode;
}

export interface ListItemsViewProps
  extends BaseViewProps<ListItemsViewModel<{}>>,
    ListItemsProps {
  fill?: boolean;
}

export class ListItemsView extends BaseView<
  ListItemsViewProps,
  ListItemsViewModel<{}>
> {
  public static renderDefaultListItemsView() {
    return <ListGroupView />;
  }

  public static getListItemsView<T extends ListItemsProps>(
    props: T,
    defaultListItemsView: (
      props: T,
    ) => React.ReactElement<ListItemsViewTemplateProps>,
  ): React.ReactElement<ListItemsViewTemplateProps> {
    if (props.view != null) {
      return props.view;
    }

    if (React.Children.count(props.children) === 1) {
      const view = React.Children.only(props.children);

      if (!React.isType(view, GridViewColumns)) {
        return view;
      }
    }

    return defaultListItemsView(props);
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { view, viewProps } = x;
      return { view, viewProps };
    });

    const listItemsView = ListItemsView.getListItemsView(
      this.props,
      ListItemsView.renderDefaultListItemsView,
    );

    const listItemsViewProps: ListItemsViewTemplateProps = {
      itemsProps: this.trimProps(
        Object.assign({}, listItemsView.props.itemsProps, rest),
      ),
      listItems: this.viewModel,
      className: classNames(
        'ListItems',
        className,
        listItemsView.props.className,
      ),
      ...this.trimProps(props.viewProps || {}),
    };

    return React.cloneElement(listItemsView, listItemsViewProps);
  }
}
