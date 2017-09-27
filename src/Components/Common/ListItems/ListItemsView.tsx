import * as React from 'react';
import * as classNames from 'classnames';

import { BaseView } from '../../React';
import { ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { ItemsProps } from '../Items/ItemsView';
import { ListGroupView } from './ListGroupView';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListItemsProps extends ItemsProps  {
  view?: React.ReactElement<ListItemsViewTemplateProps>;
}

export class ListItemsView extends BaseView<ListItemsProps, ListItemsViewModel<{}>> {
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
      itemsRenderProps: rest,
      listItems: this.state,
      className: classNames('ListItems', className, props.view.props.className),
    };

    return React.cloneElement(props.view, viewProps);
  }
}
