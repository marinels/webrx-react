import * as React from 'react';
import { Iterable } from 'ix';

import { IterableLike } from '../../../WebRx';
import { wxr } from '../../React';
import { Panel, StackPanel, PanelItemProps, PanelFragment } from '../Panel';

export interface ItemsPresenterTemplateProps {
  /**
   * template that wraps the entire control.
   * use this to compose the exterior of the the view.
   * render the items presenter where you want the items panel located.
   */
  viewTemplate?: (itemsPanel: PanelFragment, itemsPresenter: ItemsPresenter) => JSX.Element | null | false;

  /**
   * template to render panel responsible for items layout.
   * this template can control how items are rendered next to one another
   * (i.e., wrapping, stack, grid, etc...)
   */
  itemsPanelTemplate?: (itemTemplates: Array<PanelFragment>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) => PanelFragment;

  /**
   * template to render each item
   */
  itemTemplate?: (item: {}, index: number) => PanelFragment;
}

export interface ItemsPresenterProps extends React.HTMLAttributes<ItemsPresenterProps>, ItemsPresenterTemplateProps, PanelItemProps {
  /**
   * data source of items to render
   * if omitted then component children is used in place
   */
  itemsSource?: IterableLike<{}>;
}

export class ItemsPresenter extends React.Component<ItemsPresenterProps> {
  public static displayName = 'ItemsPresenter';

  public static defaultItemTemplate(item: {}, index: number) {
    return (
      <div key={ index }>{ item }</div>
    );
  }

  public static defaultPanelTemplate(itemTemplates: Array<PanelFragment>, itemsPresenter: ItemsPresenter) {
    return (
      <StackPanel
        itemClassName={ itemsPresenter.props.itemClassName }
        itemStyle={ itemsPresenter.props.itemStyle }
        itemProps={ itemsPresenter.props.itemProps }
        itemWrapper={ itemsPresenter.props.itemWrapper }
      >
        { itemTemplates }
      </StackPanel>
    );
  }

  public static defaultViewTemplate(itemsPanel: PanelFragment, itemsPresenter: ItemsPresenter) {
    const { className, props, rest } = itemsPresenter.restProps(x => {
      const { itemsSource, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, itemWrapper } = x;
      return { itemsSource, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, itemWrapper };
    });

    return (
      <div { ...rest } className={ wxr.classNames('ItemsPresenter', className) }>
        { itemsPanel }
      </div>
    );
  }

  render() {
    return this.renderViewTemplate();
  }

  protected renderItemTemplates() {
    const template = this.props.itemTemplate || ItemsPresenter.defaultItemTemplate;

    if (this.props.itemsSource == null) {
      return {
        items: undefined,
        itemTemplates: React.Children.toArray(this.props.children),
      };
    }

    const items = Iterable
      .from(this.props.itemsSource)
      .toArray();

    const itemTemplates = items
      .map<PanelFragment>((x, i) => {
        const item = template(x, i);

        return (item != null && React.isValidElement<any>(item) && item.key == null) ?
          React.cloneElement(item, { key: i }) :
          item;
      });

    return { items, itemTemplates };
  }

  protected renderPanelTemplate(): PanelFragment {
    const template = this.props.itemsPanelTemplate || ItemsPresenter.defaultPanelTemplate;
    const { items, itemTemplates } = this.renderItemTemplates();

    return template(itemTemplates, this, items);
  }

  protected renderViewTemplate(): JSX.Element | null | false {
    const template = this.props.viewTemplate || ItemsPresenter.defaultViewTemplate;
    const itemsPanel = this.renderPanelTemplate();

    return template(itemsPanel, this);
  }
}
