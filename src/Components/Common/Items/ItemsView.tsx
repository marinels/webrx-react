import * as React from 'react';
import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { ItemsViewModel } from './ItemsViewModel';
import { Panel, StackPanel, PanelItemProps, PanelRenderProps } from '../Panel';
import { ItemsPresenter, ItemsPresenterTemplateProps } from './ItemsPresenter';

export interface ItemsFacadeProps extends ItemsPresenterTemplateProps, PanelItemProps, PanelRenderProps {
}

export interface ItemsProps extends BaseViewProps, ItemsFacadeProps {
}

export class ItemsView extends BaseView<ItemsProps, ItemsViewModel<{}>> {
  public static displayName = 'ItemsView';

  updateOn(viewModel: Readonly<ItemsViewModel<{}>>) {
    return [
      viewModel.getItemsSourceProperty().changed,
    ];
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact } = x;
      return { viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact };
    });

    return (
      <div { ...rest } className={ this.classNames('Items', className) }>
        <ItemsPresenter
          itemsSource={ this.viewModel.getItemsSource() }
          { ...props }
        >
          { children }
        </ItemsPresenter>
      </div>
    );
  }
}
