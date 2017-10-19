import * as React from 'react';
import * as classNames from 'classnames';

import { ItemsView } from '../Items/ItemsView';
import { ItemsPresenter, ItemsPanelTemplate } from '../Items/ItemsPresenter';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';

export interface PanelViewProps extends ListItemsViewTemplateProps {
  itemsPanelTemplate?: ItemsPanelTemplate;
}

export class PanelView extends ListItemsViewTemplate<PanelViewProps> {
  render() {
    const { className, rest } = this.restProps(x => {
      const { listItems, itemsProps } = x;
      return { listItems, itemsProps };
    }, 'itemsPanelTemplate');

    return (
      <ItemsView
        className={ className }
        viewModel={ this.getListItems() }
        itemsPanelTemplate={ this.getItemsPanelTemplateFunction() }
        { ...this.getItemsProps() }
        { ...React.Component.trimProps(rest) }
      />
    );
  }

  protected getItemsPanelTemplate(panelFragment: PanelFragment, itemTemplates: Array<PanelFragment>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) {
    if (React.isValidElement(panelFragment)) {
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

    if (template != null) {
      return (itemTemplates: Array<PanelFragment>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) => {
        const fragment = template(itemTemplates, itemsPresenter, items);

        return this.getItemsPanelTemplate(fragment, itemTemplates, itemsPresenter, items);
      };
    }

    if (React.Children.count(this.props.children) === 1) {
      return (itemTemplates: Array<PanelFragment>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) => {
        return this.getItemsPanelTemplate(React.Children.only(this.props.children), itemTemplates, itemsPresenter, items);
      };
    }

    return undefined;
  }

  protected getSelectionProps(isSelected: boolean, elem: React.ReactElement<React.HTMLAttributes<{}>>) {
    return {
      className: classNames({ 'Selected': isSelected }, elem.props.className),
    };
  }

  protected renderPanelItem(fragment: PanelFragment, context: PanelItemContext, items: Array<{}> | undefined) {
    if (items == null) {
      return fragment;
    }

    return this.renderListItem(
      fragment,
      items[context.index],
      this.getSelectionProps.bind(this),
    );
  }
}
