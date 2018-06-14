import * as classNames from 'classnames';
import * as React from 'react';

import { ItemsPanelTemplate, ItemsPresenter } from '../Items/ItemsPresenter';
import { ItemsView } from '../Items/ItemsView';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';
import { StackPanel } from '../Panel/StackPanel';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { SelectedPropsFunction } from './SelectableListItem';

export interface PanelViewProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext,
> extends ListItemsViewTemplateProps<T, TContext> {
  itemsPanelTemplate?: ItemsPanelTemplate<T>;
  selectedProps?: SelectedPropsFunction;
}

export interface PanelViewComponentProps extends React.HTMLProps<any>, PanelViewProps {
}

export class PanelView extends ListItemsViewTemplate<PanelViewComponentProps> {
  public static getSelectedProps(isSelected: boolean, elem: React.ReactElement<React.HTMLProps<any>>) {
    return {
      className: classNames({ Selected: isSelected }, elem.props.className),
    };
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { itemsPanelTemplate, selectedProps, listItems, itemsProps } = x;
      return { itemsPanelTemplate, selectedProps, listItems, itemsProps };
    });

    return (
      <ItemsView
        className={ className }
        viewModel={ this.getListItems() }
        itemsPanelTemplate={ this.getItemsPanelTemplateFunction() }
        { ...this.getItemsProps() }
        { ...this.trimProps(rest) }
      />
    );
  }

  protected getItemsPanelTemplate(
    panelFragment: PanelFragment,
    itemTemplates: PanelFragment[],
    itemsPresenter: ItemsPresenter,
    items: Array<{}> | undefined,
  ) {
    if (React.isValidElement<any>(panelFragment)) {
      const itemsPanelTemplateProps = Object.trim({
        itemTemplate: (fragment: PanelFragment, context: PanelItemContext) => {
          return this.renderPanelItem(fragment, context, items);
        },
      });

      return React.cloneElement(panelFragment, { ...itemsPanelTemplateProps, ...panelFragment.props }, itemTemplates);
    }

    return panelFragment;
  }

  protected getItemsPanelTemplateFunction() {
    const template = this.props.itemsPanelTemplate;

    return (itemTemplates: PanelFragment[], itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) => {
      if (template != null) {
        const fragment = template(itemTemplates, itemsPresenter, items);

        return this.getItemsPanelTemplate(fragment, itemTemplates, itemsPresenter, items);
      }

      if (React.Children.count(this.props.children) === 1) {
        return this.getItemsPanelTemplate(
          React.Children.only(this.props.children),
          itemTemplates,
          itemsPresenter,
          items,
        );
      }

      return this.getItemsPanelTemplate((<StackPanel />), itemTemplates, itemsPresenter, items);
    };
  }

  protected renderPanelItem(fragment: PanelFragment, context: PanelItemContext, items: Array<{}> | undefined) {
    if (items == null) {
      return fragment;
    }

    return this.renderListItem(
      fragment,
      items[context.index],
      this.props.selectedProps || PanelView.getSelectedProps,
    );
  }
}
