import * as React from 'react';
import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { wxr, BaseView, BaseViewProps } from '../../React';
import { ItemsViewModel } from './ItemsViewModel';
import { Panel, StackPanel, PanelItemProps } from '../Panel';
import { ItemsPresenter, ItemsPresenterTemplateProps } from './ItemsPresenter';

export interface ItemsRenderProps extends ItemsPresenterTemplateProps, PanelItemProps {
}

export interface ItemsProps extends BaseViewProps, ItemsRenderProps {
}

export class ItemsView extends BaseView<ItemsProps, ItemsViewModel<{}>> {
  public static displayName = 'ItemsView';

  updateOn() {
    return [
      this.state.source.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, itemWrapper } = x;
      return { viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, itemWrapper };
    });

    return (
      <div { ...rest } className={ wxr.classNames('Items', className) }>
        <ItemsPresenter
          itemsSource={ this.state.source.value }
          itemsSource={ this.state.getItemsSource() }
          viewTemplate={ props.viewTemplate }
          itemsPanelTemplate={ props.itemsPanelTemplate }
          itemTemplate={ props.itemTemplate }
          itemClassName={ props.itemClassName }
          itemStyle={ props.itemStyle }
          itemProps={ props.itemProps }
          itemWrapper={ props.itemWrapper }
        />
      </div>
    );
  }
}
