import * as React from 'react';
import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { ItemsViewModel } from './ItemsViewModel';
import { Panel, StackPanel, PanelItemProps, PanelItemContext, PanelRenderProps } from '../Panel';
import { ItemsPresenter, ItemsPresenterTemplateProps } from './ItemsPresenter';

export interface ItemsProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends ItemsPresenterTemplateProps<T>, PanelItemProps<T, TContext>, PanelRenderProps {
}

export interface ItemsViewProps extends BaseViewProps<ItemsViewModel<{}>>, ItemsProps {
  fill?: boolean;
}

export class ItemsView extends BaseView<ItemsViewProps, ItemsViewModel<{}>> {
  public static displayName = 'ItemsView';

  updateOn(viewModel: Readonly<ItemsViewModel<{}>>) {
    return [
      viewModel.getItemsSourceProperty().changed,
    ];
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent, fill } = x;
      return { viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent, fill };
    });

    return (
      <div { ...rest } className={ this.wxr.classNames('Items', className) }>
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
