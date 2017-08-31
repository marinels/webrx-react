import * as React from 'react';
import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { wxr, BaseView, BaseViewProps } from '../../React';
import { ItemsViewModel } from './ItemsViewModel';
import { Panel, StackPanel } from '../Panel';
import { ItemsPresenter, ItemsPresenterTemplateProps } from './ItemsPresenter';

export interface ItemsProps extends BaseViewProps, ItemsPresenterTemplateProps {
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
      const { viewTemplate, itemsPanelTemplate, itemTemplate } = x;
      return { viewTemplate, itemsPanelTemplate, itemTemplate };
    });

    return (
      <div { ...rest } className={ wxr.classNames('Items', className) }>
        <ItemsPresenter
          itemsSource={ this.state.source.value }
          viewTemplate={ props.viewTemplate }
          itemsPanelTemplate={ props.itemsPanelTemplate }
          itemTemplate={ props.itemTemplate }
        />
      </div>
    );
  }
}
